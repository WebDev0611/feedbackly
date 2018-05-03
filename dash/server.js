#!/bin/env node
if(process.env.DOCKER_ENV === 'production') {
    require('sqreen');
}
require('app-module-path').addPath(__dirname);

var express = require('express');
var fs      = require('fs');
var mongoose = require('mongoose');
var Promise = require('bluebird');

mongoose.Promise = Promise;

Promise.promisifyAll(require('fs'));
Promise.promisifyAll(require('jsonwebtoken'));

var load = require('express-load');
var configDB = require('./config/database.js');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var multer = require('multer');
var cache = require('./app/lib/cache');
var errorHandlers = require('app-modules/middlewares/errors');

/**
 *  Define the sample application.
 */
var tapinApp = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.port      = process.env.PORT || 80;
    };



    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
            console.log('%s: Received %s - terminating sample app ...',
                Date(Date.now()), sig);

            cache.getClient().quit();
            mongoose.connection.close(function () {
              console.log('Mongoose disconnected on app termination');
              process.exit(1);
              console.log('%s: Node server stopped.', Date(Date.now()) );
            });

        }
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
            'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGTERM'
        ].forEach(function(element, index, array) {
                process.on(element, function() { self.terminator(element); });
            });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.app = express();

        // For uploading images
        self.app.use(multer({ dest: process.cwd() + '/public/uploads'}));
    };

    self.setupRoutes = function(){
        load('app/controllers').into(self.app);
        load('app/api').into(self.app);
        load('app/jobs').into(self.app);
    };

    self.setupMiddleWare = function(){
        var auth = require('./config/auth')()
        self.app.use(logger('dev')); // log every request to the console
        self.app.use(cookieParser()); // read cookies (needed for auth)
        self.app.use(bodyParser.json({limit: '50mb'}));
        self.app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
        self.app.use(multer());
        self.app.set('view engine', 'ejs'); // set up ejs for templating
        self.app.use(auth.initialize()); // jwt auth
        self.app.use("/", express.static(__dirname + '/public'));
        self.app.use("/v-app", express.static(__dirname + "/v-dist"));
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
        self.setupMiddleWare();
        self.setupRoutes();

        self.app.use(errorHandlers.apiErrorHandler());
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = async function() {
        //  Start the app on the specific interface (and port).
        self.server = self.app.listen(self.port, function() {
            console.log('%s: Node server started on %s ...',
                Date(Date.now() ), self.port);
        });
    };

    /**
    * Stop the server
    */
    self.stop = function() {
      cache.getClient().quit();
      self.server.close();
    }
};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */

const socket = {
    socketTimeoutMS: 0,
    keepAlive: true,
    reconnectTries: 30
}
var mongooseOptions = process.env.DB_SSL === 'true' || process.env.DB_SSL === true ? 
Object.assign({ server: { ssl: true, sslValidate: false } }, socket)
: socket;
var app = new tapinApp();


mongoose.connect(configDB.url, mongooseOptions, () => {
    const ensureIndexes = require('./app/indexes');
    ensureIndexes(mongoose.connection.db)

    app.initialize();
    app.start();
});

module.exports = app;
