const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

// Routes and middleware
const logger = require("../../lib/logger/"),
    render = require("../../server/render.js"),
    status = require("../../server/status.js"),
    fonts = require("../fonts.js"),
    errorHandlers = require("../error.js");

// Settings
const serverSettings = require("../../lib/settings");

router.use('/', express.static(path.join(__dirname, "../../", "editor")));

// router.get('/', checkAuth, (req, res, next) => {
//     res.sendFile('./editor/index.html', {root: __dirname + '/../../'});
// });


module.exports = router;
