const express = require('express');
const asyncHandler = require('express-async-handler');
const { addMessage } = require("../model/model");

const router = express.Router();
router.get('/', asyncHandler( async(req, res, next) => {

    req.io.emit("test", "Hello world!");
    res.send("Hello!");
}));

module.exports = router;
