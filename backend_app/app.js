'use strict';

// server
const express = require('express');
// const path = require('path');
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express();


var http = require('http').Server(app);
var io = require('socket.io')(http);
const router = express.Router();

const routes = require('./api/index');

//Disabling public Directory
// app.use('/profiles', express.static('public'));
// app.use('/profiles', express.static('public/profile_pictures'));
// app.use(express.static('public'));


//attach io to req.io so it accessible via all routes;
app.use(function (req, res, next) {
    req.io = io;
    next();
})

// app.use( bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '100mb'
}));
app.use(bodyParser.json({
    limit: '100mb'
}));

//enable all request. from third party sites, apps, and so on.
app.use(cors());

app.use('/api', routes);


// root
app.get('/', function (req, res) {
    // res.sendFile(publicDir + 'index.html');
    res.json({
        status: 'success',
        message: 'You are at the home page of our APP'
    })
});

const APP_PORT = process.env.PORT || 4000;

http.listen(APP_PORT, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

module.exports = app;
