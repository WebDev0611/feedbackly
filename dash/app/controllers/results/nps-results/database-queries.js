var moment = require('moment');
var mongoose = require('mongoose');
var q = require('q');
var _ = require('lodash');

var utils = require('../utils');

function getData(options) {
  return utils.aggregateHourlyCounts(options);
}

module.exports = { getData };
