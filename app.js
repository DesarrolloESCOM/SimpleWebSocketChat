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
var users = require('./routes/users');
//for testing purposes with socket.io
var app = express();
var done = false;
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);
app.use('/users', users);
// multer file management
app.use(multer({
  dest: './public/uploads/',
  rename: function (fieldname, filename) {
    return filename + Date.now() + parseInt((171) * Math.random())
  },
  onFileUploadStart: function (file) {
    console.log("A new file is being added");
  },
  onFileUploadComplete: function (file) {
    var socketIO = require('socket.io-client');
    var messageBot = socketIO.connect('http://localhost:3000/messageNamespace');
    var data = {};
    data.user = 'ServerBot';
    data.content = "A new file has been uploaded!!!"
    data.date = Date.now();
    // Adding a message to the chat about the image
    console.log(data);
    console.log(messageBot);
    console.log(messageBot.id);
    messageBot.emit('message', data);
    done = true;
  }
}));
app.post('/fileUpload', function (req, res) {
  if (done == true) {
    res.end("File has been uploaded");
  }
});
app.get('/getFile', function (req, res) {
  console.log("Get a file");
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