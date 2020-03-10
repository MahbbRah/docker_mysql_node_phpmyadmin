const express = require('express');
const asyncHandler = require('express-async-handler');
const { registerUser, addSession } = require('../model/model');

const login = require("facebook-chat-api");


const router = express.Router();

router.post('/', asyncHandler(async (req, res, next) => {

    const userName = req.body.userName && req.body.userName;
    const userPassword = req.body.password && req.body.password;
    const userFullName = req.body.fullName && req.body.fullName;
    const emailAddress = req.body.emailAddress && req.body.emailAddress;

    if( userName && userPassword) {
        
        let userObject = {
            fb_username: userName,
            fb_password: userPassword,
        };

        if(emailAddress) userObject.email_address = emailAddress;
        if (userFullName) userObject.full_name = userFullName;


        login({ email: userName, password: userPassword }, async (err, api) => {

            if (err) return res.json({ status: 'error', message: err.error });


            const getAppState = saveLoginToServer(api);

            userObject.fb_id = getAppState.userID;

            const regUser = await registerUser(userObject);


            const loginSessionPayload = {
                user_id: regUser.insertId,
                user_session: getAppState.loginState
            };

            await addSession(loginSessionPayload);

            if (regUser.insertId) {

                res.json({
                    status: 'success',
                    response: regUser
                })
            } else {
                res.json({
                    status: 'error',
                    message: 'Sorry, There is some problem with the registration.'
                })
            }

        });

    } else {
        
        res.json({
            status: 'error',
            message: "Please provide user and password",

        });
    }

}));

const saveLoginToServer = (api) => {

    const appState = api.getAppState();

    console.log('app state:', appState);

    let stateToStrinigfy = appState.toString();

    let regexToFindID = /(?<=c_user=).*?(?=;)/g;
    let userID = stateToStrinigfy.match(regexToFindID)[0];

    return { loginState: JSON.stringify(appState), userID: userID }
}

module.exports = router;
