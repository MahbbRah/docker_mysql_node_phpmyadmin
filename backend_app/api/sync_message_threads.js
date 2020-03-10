var express = require('express');
const fs = require("fs");
const asyncHandler = require('express-async-handler');
const login = require("facebook-chat-api");
const { getSession, getUserById, updateSession, getThreadsByUserId } = require('../model/model');

const { refreshSession, syncThreads } = require("../helpers/helpers");

var router = express.Router();

router.get('/', asyncHandler(async (req, res, next) => {

    const userID = req.query.user_id && req.query.user_id;
    if (!userID) {

        return res.json({ status: 'error', message: 'Please Provide User Credentials to Continue' });
    }

    var currentSession = await getSession(userID);

    if(currentSession.length === 0) {
        return res.json({ status: 'error', message: "We couldn't found any session!" });

    }

    const getUser = await getUserById(userID);

    try {
        login({ appState: JSON.parse(currentSession[0].user_session) }, async (err, api) => {

            if (err) {
                console.log("updating session ...");
                const getResult = await refreshSession(getUser[0], updateSession);

                //set the new api instance with old one.
                api = getResult.api;
            }

            console.log("requesting for threads..");

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

                //now collect threads from db and send to end user as response;
                const getUpdatedThreads = await getThreadsByUserId(userID);

                return res.json({ status: 'success', threadsFromFB: threadList, threads: getUpdatedThreads });
            });

        });
    } catch (error) {
        console.log("err on synch msg thread", error)
    }

}));


module.exports = router;
