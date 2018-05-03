"use strict";
require('./set-env.js')
const Promise = require('bluebird');
var bodyParser = require('body-parser');
var load = require('express-load');
var express = require('express')
var app = express()
var multer  = require('multer');
var PORT = process.env.PORT || 80;
app.use(bodyParser());
app.use(multer({dest: 'tmp/'}).any());
app.set('view engine', 'ejs'); // set up ejs for templating
var mongoose = require('mongoose')
const path = require('path')

// Rate limiting
var client = require('redis').createClient({ host: process.env.REDIS_HOST, port: process.env.REDIS_PORT })
var limiter = require('express-limiter')(app, client)

limiter({
  path: '/v1',
  method: 'all',
  lookup: ['headers.authorization'],
  // 5 requests per 5 seconds
  total: 5,
  expire: 1000 * 5
})

load('app/routes').into(app);
app.use('/doc', express.static(path.join(__dirname, 'apidoc')))


app.get('/', function (req, res) {
  res.send("Hello from API!");
})

app.get('/health', (req, res) => {
  if(mongoose.connection.readyState === 1) res.sendStatus(200);
  else res.send({ state: mongoose.connection.readyState })
})

var mongooseOptions = process.env.DB_SSL === 'true' || process.env.DB_SSL === true ? { server: { ssl: true, sslValidate: false } } : {};
mongoose.connect(process.env.MONGODB_URL, mongooseOptions, async () => {

  app.listen(PORT, function () {
    console.log('API app listening on port ' + PORT)
  })

});
