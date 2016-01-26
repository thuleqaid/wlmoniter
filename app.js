require('dotenv').load();
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var users = require('./routes/users');
var crms = require('./routes/crms');
var projects = require('./routes/projects');
var orders = require('./routes/orders');

var mongoose = require('mongoose');
var opts = {
  server: {
    socketOptions: { keepAlive: 1 }
  }
};
mongoose.connect(process.env.MONGODB, opts);
var passport = require('passport');
require('./routes/passport-config')(passport);

var app = express();
var server = require('http').createServer(app).listen(process.env.SOCKET_PORT, function() {});
var io = require('socket.io').listen(server);
if (process.env.ENABLE_CORS && process.env.ENABLE_CORS.toLowerCase()==="true") {
    console.log('Enable CORS');
    var cors = require('cors');
    app.use(cors());
}
io.on('connection', function(socket){
  socket.on('disconnect', function(){});
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', users(io));
app.use('/crms', crms(io));
app.use('/projects', projects(io));
app.use('/orders', orders(io));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
