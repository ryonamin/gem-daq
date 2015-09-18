var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var nunjucks = require('nunjucks');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var ipbus = require('./app/ipbus.js')(io);


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'nunjucks');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));


nunjucks.configure('views', { autoescape: true, express: app });


app.get('/', function (req, res) { res.render('home.html'); });
app.get('/glib', function (req, res) { res.render('glib.html'); });
app.get('/oh', function (req, res) { res.render('oh.html'); });
app.get('/vfat2', function (req, res) { res.render('vfat2.html'); });
app.get('/i2c', function (req, res) { res.render('i2c.html'); });
app.get('/threshold', function (req, res) { res.render('threshold.html'); });


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error.html', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error.html', {
        message: err.message,
        error: {}
    });
});

server.listen(3000);