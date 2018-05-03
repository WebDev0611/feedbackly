var _ = require('lodash');
var q = require('q');
var moment = require('moment');

var utils = require('../utils');
var queries = require('./database-queries');

function buildTable(options) {
  return queries.getData(options)
    .then(data =>{
      var deviceIdToName = {};

      for(var n = 0; n < data.deviceNames.length; n++) {
        var device = data.deviceNames[n];

          deviceIdToName[device._id] = device.name;
      }

      var texts = [];
      _.forEach(data.feedbacks, (feedback) => {
        _.forEach(feedback.data, (fbevent) => {
          if (fbevent.question_type == 'Text' && (options.questionId.toString() === fbevent.question_id.toString())) {
            texts.push({feedback_id: feedback._id, _id: fbevent.question_id, hidden: fbevent.hidden, createdAt: moment.utc(feedback.created_at_adjusted_ts * 1000).format('DD.MM.YYYY H:mm'), text: fbevent.value, channel: deviceIdToName[feedback.device_id] || '' });
          }
        });
      });

      return { charts: texts, totals: {} };
    })
}
     
function getResults(options) {
  return q.all([
    utils.aggregateTotals(_.assign({}, options, { totalsTarget: 'organization' })),
    utils.aggregateTotals(_.assign({}, options, { totalsTarget: 'channels' })),
    buildTable(options)
  ])
  .then(data => {
    data[2].totals = _.assign(data[2].totals, { organization: utils.getTotals(data[0], options), channels: utils.getTotals(data[1], options) });

    return data[2];
  });
}

module.exports = { getResults };
