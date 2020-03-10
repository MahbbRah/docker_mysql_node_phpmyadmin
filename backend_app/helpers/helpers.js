const login = require("facebook-chat-api");
const { addThread } = require("../model/model");

module.exports.refreshSession = async (User, updateSession) => {

    return new Promise(function (resolve, reject) {


        try {
            login({ email: User.fb_username, password: User.fb_password }, async (err, api) => {

                if (err) resolve({ state: false, status: 'error', message: err.error });

                const getAppState = saveLoginToServer(api);
                const updateSess = await updateSession(User.id, JSON.stringify(getAppState.loginState));

                if (updateSess) {

                    resolve({ state: true, api });
                } else {
                    resolve({ state: false, status: 'error', message: 'error while updating session to system!' })
                }

            })
        } catch (error) {
            console.log("login Updating Err From refreshSession trying again..");
            login({ email: User.fb_username, password: User.fb_password }, async (err, api) => {

                if (err) resolve({ state: false, status: 'error', message: err.error });

                const getAppState = saveLoginToServer(api);
                const updateSess = await updateSession(User.id, JSON.stringify(getAppState.loginState));

                if (updateSess) {

                    resolve({ state: true, api });
                } else {
                    resolve({ state: false, status: 'error', message: 'error while updating session to system!' })
                }

            })
        }

        
    })

}

module.exports.syncThreads = async (threadList, getUser) => {

    threadList.forEach(async (value, index) => {
        let payload = {
            user_id: getUser[0].id,
            fb_id: getUser[0].fb_id,
            thread_id: value.threadID,
            thread_details: JSON.stringify(value)
        }

        await addThread(payload);

    });
    return { status: 'success', threadList };

}

const saveLoginToServer = (api) => {

    const appState = api.getAppState();

    let stateToStrinigfy = appState.toString();

    let regexToFindID = /(?<=c_user=).*?(?=;)/g;
    let userID = stateToStrinigfy.match(regexToFindID)[0];

    return { loginState: appState, userID: userID }
}