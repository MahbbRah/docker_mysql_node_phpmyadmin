const express = require('express');
const router = express.Router();

const test = require('./test.test');
const loginRoute = require('./loginUser');
const registerUser = require('./registerUser');
const sync_message_threads = require('./sync_message_threads');
const message_threads = require('./message_threads');
const sync_thread_message = require('./sync_thread_message');
const get_thread_message = require('./get_thread_message');


router.use('/test', test);
router.use('/login', loginRoute);
router.use('/register', registerUser);


router.use('/sync_message_threads', sync_message_threads);
router.use('/message_threads', message_threads);
router.use('/sync_thread_message', sync_thread_message);
router.use('/get_thread_message', get_thread_message); //get thread messages from server and populated with db then return via api

router.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'Welcome to API Explorer'
    });
})

module.exports = router;
