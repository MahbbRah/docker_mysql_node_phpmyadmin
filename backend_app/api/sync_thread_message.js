var express = require('express');
const fs = require("fs");
const asyncHandler = require('express-async-handler');
const login = require("facebook-chat-api");
const { getSession, getUserById, getMessagesByThreadId, addMessage, updateSession } = require('../model/model');

const { refreshSession } = require("../helpers/helpers");

var router = express.Router();

router.get('/', asyncHandler(async (req, res, next) => {

    const userID = req.query.user_id && req.query.user_id;
    let threadID = req.query.thread_id && req.query.thread_id;
    if (!userID && !threadID) {

        return res.json({ status: 'error', message: 'Please Provide User Credentials to Continue' });
    }

    var currentSession = await getSession(userID);

    if(currentSession.length === 0) {
        return res.json({ status: 'error', message: "We couldn't found any session!" });

    }

    const getUser = await getUserById(userID);

    const getMsgbyThread = await getMessagesByThreadId(threadID);

    //if there is chat message then load them first.
    if (getMsgbyThread.length) {
        return res.json({ status: 'success', response: getMsgbyThread });
    } else {
        try {
            login({ appState: JSON.parse(currentSession[0].user_session) }, async (err, api) => {

                if (err) {
                    console.log("updating session ...");
                    const getResult = await refreshSession(getUser[0], updateSession);

                    //set the new api instance with old one.
                    api = getResult.api;
                }

                //save the API instance to req;
                process.env.loginAPI = api;
                console.log("instance has been set!");


                // if (getMsgbyThread.length) timestamp = getMsgbyThread[0].message_timestamp;

                console.log("requesting for thread messages..")
                let amount = 500;
                let timestamp = undefined;

                api.getThreadHistory(threadID, amount, timestamp, (error, messageArr) => {

                    if (error) return res.json({ status: 'error', response: error });

                    const countMsg = messageArr.length ? messageArr.length - 1 : messageArr.length;

                    messageArr.forEach(async (value, index) => {

                        let payload = {
                            user_id: userID,
                            thread_id: threadID,
                            message_id: value.messageID,
                            message_body: value.body ? value.body : "",
                            message_timestamp: value.timestamp,
                            sender_id: value.senderID,
                            full_message: JSON.stringify(value)
                        }

                        await addMessage(payload);

                        if (countMsg == index) {
                            const getThreadMsgAgain = await getMessagesByThreadId(threadID);
                            return res.json({ status: 'success', response: getThreadMsgAgain });
                        }

                    });

                });

            });
        } catch (error) {
            console.log("error Sync msg", error)
        }
    }


}));


module.exports = router;
