#!/bin/env node
require('app-module-path').addPath(__dirname);

var express = require('express');
var fs = require('fs');
var _ = require('lodash');
var mongoose = require('mongoose');
var configDB = require('./config/database.js');
var path = require('path');
var load = require('express-load');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressValidator = require('express-validator');
var cors = require('cors');
var errors = require('app-modules/errors');
var errorHandlers = require('app-modules/middlewares/errors');
var requestLogger = require('./lib/log').requestLogger;

mongoose.Promise = require('bluebird').Promise;

var redirector = function(req, res, next){
  var host = req.get('host');
  if(host.indexOf('fbly-production-client-62286.onmodulus.net') > -1) res.redirect('https://client.feedbackly.com' + req.url);
  return next();
}

var tapinApp = function() {
    var self = {};

    self.setupVariables = function() {
      self.port = process.env.PORT || 80;
    };

    self.initializeServer = function() {
      self.app = express();
    };

    self.setupRoutes = function(){
      load('./api').into(self.app);
    };

    self.setupMiddleWare = function(){
        self.app.use(requestLogger());
        self.app.use(cookieParser());
        self.app.use(bodyParser.json({ limit: '50mb' }));
        self.app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
        self.app.set('view engine', 'ejs');
        self.app.use('/dist', express.static(__dirname + '/dist', { maxAge: '1d' }));
        self.app.use('/public', express.static(__dirname + '/public', { maxAge: '1d' }));
        //self.app.use('*', cors());
        self.app.use(cors());
    };

    self.initialize = function() {
        self.setupVariables();

        self.initializeServer();
        self.setupMiddleWare();
        self.setupRoutes();

        self.app.use((req, res, next) => {
          return next(new errors.NotFoundError());
        });

        self.app.use('/api', errorHandlers.apiErrorHandler());
        self.app.use(errorHandlers.clientErrorHandler());
    };

    self.start = async function() {
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s ...',
                Date(Date.now() ), self.port);
        });

        var a = await mongoose.connection.db.command({whatsmyuri:1})
        mongoose.connection.db.collection("connections-test").insert({ip: a.you, hostname: process.env.HOSTNAME, app: 'client', created_at: new Date()})
    };

    return self;
};

var mongooseOptions = process.env.DB_SSL === 'true' || process.env.DB_SSL === true ? { server: { ssl: true, sslValidate: false } } : {};

let version = Date.now();
if(process.env.DOCKER_ENV == 'production'){
try{
  version = fs.readFileSync(process.cwd() + '/prod_version').toString();
} catch(e){}
}

process.env.buildVersion = parseInt(version)

var app = new tapinApp();
mongoose.connect(configDB.url, mongooseOptions, () => {
  app.initialize();
  app.start();
})
