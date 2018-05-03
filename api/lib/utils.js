var ObjectId = require('mongoose').Types.ObjectId;
var _ = require('lodash')

function mapObjectId(array){
  return _.map(array, item => ObjectId(item))
}

module.exports = {mapObjectId}
