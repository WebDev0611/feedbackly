"use strict";
require('./set-env.js')
const Promise = require('bluebird');
var bodyParser = require('body-parser');
var express = require('express')
var app = express()
var PORT = process.env.PORT || 80;
app.use(bodyParser());
var mongoose = require('mongoose');
var mongooseOptions = process.env.DB_SSL === 'true' || process.env.DB_SSL === true ? { server: { ssl: true, sslValidate: false } } : {};

var Main = require('./app/functions/main')

app.get('/', (req, res) => {
  res.send("Hello from notifications api")
})

app.get('/health', (req, res) =>{
  if(mongoose.connection.readyState === 1) res.send(200)
  else {
    res.status(500).send({state: mongoose.connection.readyState})
    console.log('no mongo connection')
    process.exit(1)
  }
})

app.post('/handle', function (req, res) {
  var fbevent = req.body
  Main.handleMessage(fbevent)
  .then((a) => res.send(a))
  .catch(err => res.status(500).send(err))
})

mongoose.connect(process.env.MONGODB_URL, mongooseOptions, () => {

  app.listen(PORT, function () {
    console.log('Notifications app listening on port ' + PORT)
  })

});
