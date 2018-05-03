"use strict";
require('./set-env')
const Promise = require('bluebird');
var bodyParser = require('body-parser');
require('bluebird-co');
var express = require('express')
var app = express()
var PORT = process.env.PORT || 80;
app.use(bodyParser());
 var expressMongoDb = require('express-mongo-db');
app.use(expressMongoDb(process.env.MONGODB_URL));


var sendMail = require('./app/mailer/send');
var Fns = require('./app/functions')
var Main = require('./app/main')

app.get('/', function (req, res) {
  res.send("Hello from upsell-handler");
})

app.get('/health', (req, res) => {
  res.send('We are healthy!')
});

app.post('/handle', (req, res) => {
  console.log('Fbevent in', req.body._id)
  var fbevent = req.body;
  Main.handle(fbevent, req.db)
    .then(() => res.send(200))
    .catch(err => res.status(500).send(err))
})

app.listen(PORT, function () {
  console.log('API app listening on port ' + PORT)
})
