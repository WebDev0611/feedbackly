"use strict";
// require('./set-env.js')
const Promise = require('bluebird');
// var bodyParser = require('body-parser');
var express = require('express')
var app = express()
var PORT = process.env.PORT || 80;
// app.use(bodyParser());
var _ = require('lodash')
const check = require('./check').check

app.get('/all', (req, res) => {
  Promise.all([
    check('http://api/health', 'API'),
    check('http://dash/health', 'DASH'),
    check('http://client/health', 'CLIENT'),
    check('http://barcode/?bcid=isbn&text=978-1-56581-231-4+52250&includetext&guardwhitespace', 'BARCODE'),
    check('http://upsell-handler/health', 'UPSELL HANDLER'),
    check('http://notification-handler/health', 'NOTIFICATION HANDLER'),
    check('http://pdfservice/health', 'PDF SERVICE')
  ])
  .then(results => {
    var errors = _.filter(results, r => r.status > 200);
    if(errors.length > 0) res.status(503).send(results);
    else res.sendStatus(200);
  })
  .catch(e => {
    res.sendStatus(500).send(e)
  })

  })

  app.listen(PORT, function () {
    console.log('healthchecks app listening on port ' + PORT)
  })
