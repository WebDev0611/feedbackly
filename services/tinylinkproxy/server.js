"use strict";
require('./set-env.js')
var express = require('express')
var app = express()
var PORT = process.env.PORT || 80;
var mongoose = require('mongoose');
var mongooseOptions = process.env.DB_SSL === 'true' || process.env.DB_SSL === true ? { server: { ssl: true, sslValidate: false } } : {};

var Main = require('./app/main')

app.get('/', (req, res) => {
  res.send("Hello from tinylinkproxy api")
})

app.get('/:surveyMiniId/:contactMiniId', Main)
app.get('/:surveyMiniId', Main);

app.get('/health', (req, res) =>{
  if(mongoose.connection.readyState === 1) res.send(200)
  else {
    res.status(500).send({state: mongoose.connection.readyState})
    console.log('no mongo connection')
    process.exit(1)
  }
})


mongoose.connect(process.env.MONGODB_URL, mongooseOptions, async () => {
  app.listen(PORT, function () {
    console.log('Notifications app listening on port ' + PORT)
  })
});
