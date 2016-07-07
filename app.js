var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var errorhandler = require('errorhandler');
var session = require('express-session');
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(session);

var db = require('./model/db');
var authenticateUser = require('./middleware/authenticate_user');
var user = require("./model/user");

var routes = require('./routes/index');
var welcome = require('./routes/welcome');
var dependencies = require('./routes/dependencies');
var api = require('./routes/api');

var app = express();

if (process.env.NODE_ENV == 'development') {
    app.use(errorhandler())
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, 'public', "assets", "img", 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(require('node-sass-middleware')({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true,
    sourceMap: true
}));
app.use(session({
    cookie: {
        maxAge: 100 * 365 * 24 * 60 * 60 * 1000 // Set the cookie expiry to about 100 years
    },
    saveUninitialized: true,
    resave: false,
    secret: "O5PQmCkFdJ8m6HSbwYBQF6D8gdgT0fFy",
    store: new MongoStore({ url: db.url })

}));

app.use(express.static(path.join(__dirname, 'public')));
app.use("/dependencies", dependencies);  // Load static dependencies

app.use(authenticateUser("/welcome", ["/api/users", "/api/users/current"]));

app.use('/welcome', welcome);
// Routes that require user authentication
app.use('/api', api);
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found ' + req.originalUrl);
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
// no stacktraces leaked to users
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
