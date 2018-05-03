var mongoose = require('mongoose');
var _ = require('lodash');
var Promise = require('bluebird');

var Fbevent = require('../../models/fbevent');
var Question = require('../../models/question');

function getData(options) {
  var match = {
    question_id: mongoose.Types.ObjectId(options.questionId),
    created_at_adjusted_ts: {
      $gte: options.from,
      $lte: options.to
    }
  };

  var group = {
    _id: '$data',
    count: { $sum: 1 }
  };

  return Fbevent.aggregate([
    { $match: match },
    { $unwind: '$data' },
    { $group: group }
  ])
  .exec();
}

function getResults(options) {
  return Promise.all([getData(options), Question.findById(options.questionId)])
    .spread((data, question) => {
      var translationData =  _.chain(question).get('translations[0].data').filter(value => value.hidden !== true);

      var idToIndex = translationData
        .map((value, index) => { return { id: value.id, index } })
        .reduce((map, value) => {
          map[value.id] = value.index;

          return map;
        }, {})
        .value();

      var idToData = translationData
        .reduce((map, value) => {
          map[value.id.toString()] = value.data || {};

          return map;
        }, {})
        .value();

      var numberOfSeries = _.keys(idToIndex).length;

      var chart = _.chain(_.keys(idToIndex))
        .sortBy(id => idToIndex[id])
        .map(id => {
          var category = _.find(data, { _id: id });
          var name = id;
          var dataArr = _.fill(new Array(numberOfSeries), 0);

          if(category !== undefined) {
            dataArr[idToIndex[id]] = category.count;
          }

          return {
            name,
            data: dataArr
          };
        })
        .value();

      return { chart, idToData, heading: _.get(question, 'translations[0].heading') || '', subtitle: _.get(question, 'translations[0].subtitle') || '' };
    });
}

module.exports = { getResults };
