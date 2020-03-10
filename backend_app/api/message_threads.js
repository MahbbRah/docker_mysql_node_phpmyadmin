var express = require('express');
const fs = require("fs");
const login = require("facebook-chat-api");
const asyncHandler = require('express-async-handler');

const { getThreadsByUserId } = require('../model/model');

var router = express.Router();

router.get('/', asyncHandler(async (req, res, next) => {

    const userID = req.query.user_id && req.query.user_id;

    if (!userID) {

        return res.json({ status: 'error', message: 'Please Provide User Credentials to Continue' });
    }

    const getThreadsFromDatabase =  await getThreadsByUserId(userID);
    return res.json({
        status: 'success',
        threads: getThreadsFromDatabase
    })

}));

module.exports = router;
