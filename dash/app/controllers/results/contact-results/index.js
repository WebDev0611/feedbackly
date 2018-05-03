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

        deviceIdToName[device._id.toString()] = device.name;
      }

      var headings = {};
      var headingIndex = 0;
      options.values.forEach(value => {
        headings[value.toString()] = { title: options.legend[value] || value, index: headingIndex };
        headingIndex++;
      }); 

      for(var n = 0; n < data.contacts.length; n++) {
        var contact = data.contacts[n];
  
        _.forEach(contact.data, (data) => {
          (data.question_type === 'Contact' && (options.questionId.toString() === data.question_id.toString())) ? _.forEach(data.value, (feedback) => {
            if(!headings[feedback.id.toString()]) {
              headings[feedback.id.toString()] = { title: options.legend[feedback.id.toString()] || feedback.id, index: headingIndex };
              headingIndex++;
            }
          }) : '';
        });
      }

      var tableHeadings = _.chain(_.values(headings)).sortBy('index').map(heading => heading.title).value();
      var table = [];

      for(var n = 0; n < data.contacts.length; n++) {
        var contact = data.contacts[n];

        var contactObj = {
          createdAt: moment.utc(contact.created_at_adjusted_ts * 1000).format('DD.MM.YYYY H:mm'),
          channel: deviceIdToName[contact.device_id.toString()],
          values: new Array(tableHeadings.length)
        }

        _.forEach(contact.data, (data) => {
          data.question_type === 'Contact' && (options.questionId.toString() === data.question_id.toString()) ? _.forEach(data.value, (feedback) => {
            var index = headings[feedback.id.toString()].index;

            if((feedback.data || '').toString() === 'false') {
              contactObj.values[index] = '';
            } else {
              contactObj.values[index] = feedback.data || '';
            }

          }) : '';
        });
        if(contactObj.values.length > 0) table.push(contactObj);
      }

      return { charts: { table, tableHeadings }, totals: {} };
    });
}

function getResults(options) {
  return q.all([
    utils.aggregateTotals(_.assign({}, options, { totalsTarget: 'organization', unwindData: false })),
    utils.aggregateTotals(_.assign({}, options, { totalsTarget: 'channels', unwindData: false })),
    buildTable(options)
  ])
  .then(data => {
    data[2].totals = _.assign(data[2].totals, { organization: utils.getTotals(data[0], options), channels: utils.getTotals(data[1], options) });

    return data[2];
  });
}

module.exports = { getResults };
