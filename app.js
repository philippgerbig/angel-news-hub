var express = require('express'),
  app = express(),
  server = require('http').createServer(app),
  format = require('util').format,
  config = require('./config.js'),
  //io = require('socket.io').listen(config.socketIOPort);
  io = require('socket.io').listen(server);

io.set('transports', ['xhr-polling']);

app.use("/static", express.static(__dirname + '/static'));
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({
  secret: config.secret
}));
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

io.set('log level', 1);

server.listen(config.port);

// make static string in config available in views
app.use(function(req, res, next) {
  res.locals.configStrings = config.hub;
  next();
});

require('./modules/routes')(app);
var models = require('./modules/models');
var sockets = require('./modules/sockets')(io, models);

var shiftCron = require('./modules/shifts')(models, sockets);
var scheduleCron = require('./modules/schedule')(models, sockets);

shiftCron.start();
scheduleCron.start();