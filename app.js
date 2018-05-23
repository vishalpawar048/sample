var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var log4js = require('log4js');
var app = express();

//Internal dependencies
var Logger = require('./utils/logger.js').Logger;
var logger = new Logger('[app]');
log4js.configure('./config/logConfig.json');

//routes
var customerRoutes = require('./routes/customerRoute.js');
var transactionRoutes = require('./routes/transactionRoute.js');
var adminRoutes = require('./routes/adminRoute.js');
var commonRoutes = require('./routes/commonRoute.js');
var distributorRoutes = require('./routes/distributorRoute.js');

app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static('./uploads'));
app.use('/transactionFiles', express.static('./transactionFiles'));

// Connect to MongoDB
var db = require('./dao/db.js');
db.connectToMongo();


app.all("/*", function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Cache-Control,Pragma, Origin, Authorization, Content-Type, X-Requested-With,X-XSRF-TOKEN, querycriteria,x-access-token,sessionId, userId");
    next();
});

logger.info("Initializing router..");
app.all('*', customerRoutes);
app.all('*', transactionRoutes);
app.all('*', adminRoutes);
app.all('*', commonRoutes);
app.all('*', distributorRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found - ' + req.url);
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    logger.error(JSON.stringify(err.stack));
    logger.error(JSON.stringify(err.message));
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.send(err);
});

module.exports = app;