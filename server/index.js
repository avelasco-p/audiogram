// Dependencies
const express = require("express"),
    morgan = require('morgan'),
    session = require('express-session'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    checkAuth = require('./middleware/check-auth'),
    compression = require("compression"),
    path = require("path"),
    multer = require("multer"),
    uuid = require("uuid"),
    mkdirp = require("mkdirp");

// Routes and middleware
const logger = require("../lib/logger/"),
    render = require("./render.js"),
    status = require("./status.js"),
    fonts = require("./fonts.js"),
    errorHandlers = require("./error.js");

// Settings
const serverSettings = require("../lib/settings/");


//mongoose settings
mongoose.connect('mongodb://localhost/dm-audiogram', {
  useCreateIndex: true,
  useNewUrlParser: true,
});

//mongoose.set('debug', true);

//starting express app
const app = express();


//middlewares
app.use(compression());
//app.use(morgan('dev'));
// app.use(logger.morgan());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  name: 'jwttoken',
  secret: 'secretKey',
  resave: false,
  saveUninitialized: false,
}));


//routes
const loginRoutes = require('./routes/login');

// Options for where to store uploaded audio and max size
let fileOptions = {
  storage: multer.diskStorage({
    destination: function(req, file, cb) {

      let dir = path.join(serverSettings.workingDirectory, uuid.v1());

      mkdirp(dir, function(err) {
        return cb(err, dir);
      });
    },
    filename: function(req, file, cb) {
      cb(null, "audio");
    }
  })
};

if (serverSettings.maxUploadSize) {
  fileOptions.limits = {
    fileSize: +serverSettings.maxUploadSize
  };
}

// On submission, check upload, validate input, and start generating a video
app.post("/submit/", [multer(fileOptions).single("audio"), render.validate, render.route]);

// If not using S3, serve videos locally
if (!serverSettings.s3Bucket) {
  app.use("/video/", express.static(path.join(serverSettings.storagePath, "video")));
}

// Serve custom fonts
app.get("/fonts/fonts.css", fonts.css);
app.get("/fonts/fonts.js", fonts.js);

if (serverSettings.fonts) {
  app.get("/fonts/:font", fonts.font);
}

// Check the status of a current video
app.get("/status/:id/", status);


// Serve background images and themes JSON statically
app.use("/settings/", function(req, res, next) {

  // Limit to themes.json and bg images
  if (req.url.match(/^\/?themes.json$/i) || req.url.match(/^\/?backgrounds\/[^/]+$/i)) {
    return next();
  }

  return res.status(404).send("Cannot GET " + path.join("/settings", req.url));

}, express.static(path.join(__dirname, "..", "settings")));

// Serve editor files statically
app.use('/login', loginRoutes);
app.use("/", checkAuth, express.static(path.join(__dirname, "..", "editor")));

app.use(errorHandlers);

module.exports = app;
