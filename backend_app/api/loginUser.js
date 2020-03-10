const express = require('express');
const asyncHandler = require('express-async-handler');
const { 
    loginUser, 
    getSession, 
    updateSession, 
    getLastThreadByUserId, 
    addMessage, 
    getMessagesByThreadId,
    getThreadsByUserId
} = require('../model/model');
const login = require("facebook-chat-api");
const userAgents = require("../helpers/userAgents");
const { syncThreads, refreshSession } = require("../helpers/helpers");


const router = express.Router();

router.post('/', asyncHandler(async (req, res, next) => {

    const userName = req.body.userEmail && req.body.userEmail;
    const userPassword = req.body.password && req.body.password;
    
    if( userName && userPassword) {
        
        const getUser =  await loginUser(userName, userPassword);
        if(getUser.length > 0) {

            const User = getUser[0];
            const user_id = User.id;
            const getLoginSession = await getSession(user_id);
            try {
                login({ appState: JSON.parse(getLoginSession[0].user_session) }, async (err, api) => {

                    if (err) {
                        console.log("updating session ...");
                        const getResult = await refreshSession(User, updateSession);

                        //set the new api instance with old one.
                        api = getResult.api;
                    }

                    api.setOptions({
                        forceLogin: true,
                        selfListen: true,
                        userAgent: userAgents[Math.floor(Math.random() * userAgents.length)]
                    });

                    api.listenMqtt(async (errListen, successListen) => {

                        if (errListen) return console.log(errListen, "error while listening!");

                        console.log(successListen, "successListen");

                        if (successListen.type === "message") {

                            //build new message as local database;
                            let formatNewMessage = {
                                message_body: successListen.body,
                                message_timestamp: successListen.timestamp,
                                message_id: successListen.messageID,
                                thread_id: successListen.threadID,
                                user_id: user_id,
                                sender_id: successListen.senderID,
                                full_message: JSON.stringify(successListen)
                            };

                            const addMsg = await addMessage(formatNewMessage);
                            console.log(addMsg);
                            //emmit msg
                            req.io.emit(successListen.type, successListen);
                        }

                    });

                    req.io.on("connection", (socket) => {
                        console.log("ready from loginPage");
                        socket.on("getThread", async (data) => {


                            try {
                                let payload = ["100001168532365"];
                                let requestType = "getThreadInfo";
                                console.log("asking for thread infos:", Date.now())
                                const getThreadInfo = await apiHandler(api, requestType, payload);
                                console.log("completed request!", Date.now())
                                if (getThreadInfo) {
                                    console.log("sending response..", getThreadInfo);
                                    socket.emit("getThreadResponse", getThreadInfo)
                                }
                            } catch (error) {
                                console.log("error on getting thread:", error)
                            }

                        });

                        //Send Message to user;
                        socket.on("sendMessage", async (data) => {

                            let threadID = data.threadID;
                            let msg = { body: data.messageString };
                            let requestType = "sendMessage";
                            try {
                                const getThreadInfo = await apiHandler(api, requestType, [msg, threadID]);

                                if (getThreadInfo) {
                                    socket.emit("sendMessageResponse", { status: 'success', response: getThreadInfo });
                                }
                            } catch (error) {
                                socket.emit("sendMessageResponse", { status: 'error', response: error })
                            }

                        });

                        //Sync Threads with Facebook.
                        socket.on("syncThreads", async (data) => {

                            let category = [];
                            let amount = 1000;
                            let timestamp = null;
                            let requestType = "getThreadList";
                            try {
                                const getThreadList = await apiHandler(api, requestType, [amount, timestamp, category]);

                                if (getThreadList) {
                                    //sync new threads with database;
                                    await syncThreads(getThreadList, getUser);

                                    //now collect threads from db and send to end user as response;
                                    const getUpdatedThreads = await getThreadsByUserId(user_id);
                                    socket.emit("syncThreadsResponse", { status: 'success', response: getUpdatedThreads });
                                }
                            } catch (error) {
                                socket.emit("syncThreadsResponse", { status: 'error', response: error })
                            }

                        });

                        //Sync Messages with fb by thread
                        socket.on("syncThreadMessages", async (data) => {

                            let threadID = data.threadID;
                            let amount = 500;
                            let timestamp = undefined;
                            let requestType = "getThreadHistory";
                            try {
                                const getThreadMessages = await apiHandler(api, requestType, [threadID, amount, timestamp]);

                                if (getThreadMessages) {

                                    getThreadMessages.forEach(async (value, index) => {

                                        let payload = {
                                            user_id: user_id,
                                            thread_id: threadID,
                                            message_id: value.messageID,
                                            message_body: value.body ? value.body : "",
                                            message_timestamp: value.timestamp,
                                            sender_id: value.senderID,
                                            full_message: JSON.stringify(value)
                                        }

                                        await addMessage(payload);

                                    });

                                    const getThreadMsgAgain = await getMessagesByThreadId(threadID);
                                    socket.emit("syncThreadMessagesResponse", { status: 'success', response: getThreadMsgAgain });
                                }
                            } catch (error) {
                                socket.emit("syncThreadMessagesResponse", { status: 'error', response: error })
                            }

                        });

                        //Sync Messages with fb by thread
                        socket.on("syncIfNoThreadMessage", async (data) => {

                            let threadID = data.threadID;

                            //now check if there is thread messages then don't ask to server and get from localDB;
                            const getMsgbyThread = await getMessagesByThreadId(threadID);
                            if (getMsgbyThread.length) {
                                socket.emit("syncIfNoThreadMessageResponse", { status: 'success', response: getMsgbyThread });
                                return;
                            }

                            let amount = 500;
                            let timestamp = undefined;
                            let requestType = "getThreadHistory";

                            try {
                                const getThreadMessages = await apiHandler(api, requestType, [threadID, amount, timestamp]);

                                if (getThreadMessages) {

                                    getThreadMessages.forEach(async (value, index) => {

                                        let payload = {
                                            user_id: user_id,
                                            thread_id: threadID,
                                            message_id: value.messageID,
                                            message_body: value.body ? value.body : "",
                                            message_timestamp: value.timestamp,
                                            sender_id: value.senderID,
                                            full_message: JSON.stringify(value)
                                        }

                                        await addMessage(payload);

                                    });

                                    const getThreadMsgAgain = await getMessagesByThreadId(threadID);
                                    socket.emit("syncIfNoThreadMessageResponse", { status: 'success', response: getThreadMsgAgain });
                                }
                            } catch (error) {
                                socket.emit("syncIfNoThreadMessageResponse", { status: 'error', response: error })
                            }

                        });
                    })


                    // const getLoggedInUserID = api.getCurrentUserID();

                    //check threads if available or not.
                    const selectThread = await getLastThreadByUserId(user_id);

                    const responseToSend = {
                        status: 'success',
                        message: 'Logged in Successfully!',
                        currentState: JSON.parse(getLoginSession[0].user_session),
                        user_id: user_id,
                        name: User.full_name,
                        fb_id: User.fb_id
                    }

                    if (selectThread.length === 0) {

                        console.log("No threads found..Syncing Threads");
                        let category = [];
                        let amount = 1000;
                        let timestamp = null;
                        api.getThreadList(amount, timestamp, category, async (threadErr, threadList) => {
                            if (threadErr) return res.json({ status: 'error', message: threadErr });
                            if (threadList.length === 0) {
                                return res.json({
                                    status: 'error',
                                    message: 'No Threads Found with this user!'
                                })
                            }

                            //sync new threads with database;
                            await syncThreads(threadList, getUser);

                            return res.json(responseToSend)
                        });
                    } else {
                        return res.json(responseToSend)
                    }

                });
            } catch (loginErr) {
                return res.json({
                    status: 'error',
                    message: loginErr
                });
            }

        } else {
            res.json({
                status: 'error',
                message: 'Login User/Password doesn\'t match!'
            })
        }

    } else {

        res.json({
            status: 'error',
            message: "Please provide email and password",

        });
    }

}));


const apiHandler = (api, requestType, otherParams) => {
    
    return new Promise((resolve, reject) => {

        api[requestType](...otherParams, async (err, result) => {
            if (err) return reject(err);

            resolve(result);

        })
    })
    
}

module.exports = router;
