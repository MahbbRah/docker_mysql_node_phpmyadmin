const connection = require('../database/connection');
                                                                                                                                                                                                                                                                                                                                                                                                            

module.exports.loginUser = (userName, password) => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM fb_user WHERE fb_username=? AND fb_password=?`, [userName, password], (err, results) => {

            if(err) resolve(false);
            resolve(results);
        });
    });
}

module.exports.registerUser = (User) => {
    return new Promise((resolve, reject) => {
        connection.query(`INSERT INTO fb_user SET ?`, User, (err, results) => {

            if(err) resolve(false);
            resolve(results);
        });
    });
}

module.exports.getUserById = (user_id) => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM fb_user WHERE id=?`, user_id, (err, results) => {

            if (err) resolve(false);
            resolve(results);
        });
    });
}

module.exports.addSession = (session) => {
    return new Promise((resolve, reject) => {
        connection.query(`INSERT INTO login_session SET ?`, session, (err, results) => {

            if(err) resolve(false);
            resolve(results);
        });
    });
}

module.exports.getSession = (user_id) => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM login_session WHERE user_id=?`, user_id, (err, results) => {

            if(err) resolve(false);
            resolve(results);
        });
    });
}

module.exports.updateSession = (user_id, newSession) => {

    return new Promise(function (resolve, reject) {
        connection.query(`UPDATE login_session SET user_session=? WHERE user_id=?`, [newSession, user_id], (err, results) => {
            if (err) resolve(err);
            resolve(results);
        })
    })

}

module.exports.addThread = (Thread) => {
    return new Promise((resolve, reject) => {
        connection.query(`INSERT INTO message_threads SET ?`, Thread, (err, results) => {

            if (err) resolve(false);
            resolve(results);
        });
    });
}

module.exports.getThreadsByUserId = (user_id) => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM message_threads WHERE user_id=?`, user_id, (err, results) => {

            if (err) resolve(false);
            resolve(results);
        });
    });
}

module.exports.getLastThreadByUserId = (user_id) => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM message_threads WHERE user_id=? ORDER BY id DESC LIMIT 1`, user_id, (err, results) => {
            if (err) resolve(false);
            resolve(results);
        });
    });
}

module.exports.addMessage = (Message) => {
    return new Promise((resolve, reject) => {
        connection.query(`INSERT INTO thread_messages SET ?`, Message, (err, results) => {

            if (err) resolve(err);
            resolve(results);
        });
    });
}

module.exports.getMessagesByThreadId = (thread_id) => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM thread_messages WHERE thread_id=?`, thread_id, (err, results) => {

            if (err) resolve(false);
            resolve(results);
        });
    });
}

module.exports.getLastMessageByThread = (thread_id) => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM thread_messages WHERE thread_id=? ORDER BY id DESC LIMIT 1`, thread_id, (err, results) => {

            if (err) resolve(false);
            resolve(results);
        });
    });
}


