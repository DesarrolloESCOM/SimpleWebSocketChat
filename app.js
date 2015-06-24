var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');
var io_client = require('socket.io-client');
//
var routes = require('./routes/index');
//for testing purposes with socket.io
var app = express();
var done = false;
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);
// multer file management
app.use(multer({
  dest: './public/uploads/',
  rename: function (fieldname, filename, req, res) {
    var date = new Date();
    var fileName = req.body.fileUserName +"_"+ date.toISOString();
    var socketIO = require('socket.io-client');
    var messageBot = socketIO.connect('http://127.0.0.1/messageNamespace');
    var notificationBot = socketIO.connect('http://127.0.0.1/notificationNamespace');
    // Adding a message to the chat about the file
    var data = {};
    data.user = 'ServerBot';
    data.content = "El usuario <i>"+req.body.fileUserName+"</i> subió el archivo ["+fileName+"]";
    data.date = Date.now();    
    messageBot.emit('message', data);
    // Updating files list
    notificationBot.emit('getUploadedFiles', fileName);
    return fileName
  },
  onFileUploadComplete: function (file, req, res) {
    done = true;
  }
}));
app.post('/fileUpload', function (req, res) {
  if (done == true) {
    res.end("File has been uploaded");
  }
});
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
module.exports = app;