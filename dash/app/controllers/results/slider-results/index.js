var _ = require('lodash');
var moment = require('moment');
var Promise = require('bluebird');

var queries = require('./database-queries');
var utils = require('../utils');

function generateSliderCharts(stream, options) {
  var dailyRegular = {};
  var averages = {};
  var totals = { regular: {}, normalized: {} };
  var scale = options.smallScale ? 5 : 10;

    options.values.forEach(value => {
      dailyRegular[value.toString()] = { name: options.legend[value.toString()] || value.toString(), data: [] };
      averages[value.toString()] = utils.createEmptyDayObject(options.dateFrom, options.dateTo, { sum: 0, count: 0 });
      totals.regular[value.toString()] = { count: 0 };
      totals.normalized[value.toString()] = { count: 0, sum: 0 };
    });

  return new Promise((resolve, reject) => {
    stream.on('data', slider => {
      var date = slider.created_at_adjusted_ts * 1000;
      
      _.forEach(slider.data, (data) => {
        data.question_type === 'Slider' ? _.forEach(data.value, (value) => {
          try {
            var dataValue = parseFloat(value.data) * scale;

            dailyRegular[value.id.toString()] = dailyRegular[value.id.toString()] || { name: options.legend[value.id.toString()] || value.id.toString(), data: [] }
            dailyRegular[value.id.toString()].data.push([date, dataValue]);

            totals.regular[value.id.toString()] = totals.regular[value.id.toString()] || { count: 0 };
            totals.normalized[value.id.toString()] = totals.normalized[value.id.toString()] || { count: 0, sum: 0 };

            totals.regular[value.id.toString()].count++;
            totals.normalized[value.id.toString()].count++;
            totals.normalized[value.id.toString()].sum += dataValue;

            averages[value.id.toString()] = averages[value.id.toString()] || utils.createEmptyDayObject(options.dateFrom, options.dateTo, { sum: 0, count: 0 });

            var averageDay = averages[value.id.toString()][moment.utc(date).startOf('day').unix().toString()];

            if(averageDay) {
              averageDay.count++;
              averageDay.sum += dataValue  ;
            }
          } catch(err) {}
        }) : '';
      });
    });

    stream.once('end', () => {
      var dailyRegularArray = [];

      for(var id in dailyRegular) {
        dailyRegularArray.push(dailyRegular[id]);
      }

      var dailyAverage = [];
      var regular = [];

      for(var id in averages) {
        var name = options.legend[id] || id;
        var normalizedData = totals.normalized[id];
        var regularData = totals.regular[id];

        regular.push({
          name,
          id,
          value: regularData.count,
          average: normalizedData.count === 0 ? 0 : _.round(normalizedData.sum / normalizedData.count)
        });

        var chart = { name, data: [] };
        var slider = averages[id];

        for(var date in slider) {
          var values = slider[date];
          var average = values.count === 0 ? null : _.round(values.sum / values.count);
          chart.data.push([parseInt(date) * 1000, average]);
        }

        dailyAverage.push(chart);
      }

      var charts = { daily: { regular: dailyRegularArray, average: dailyAverage }, options: { dateFrom: options.dateFrom, dateTo: options.dateTo } }

      resolve({ charts: charts, totals: { regular } });
    });

  });


}

function getResults(options) {
  return Promise.all([
    utils.aggregateTotals(_.assign({}, options, { totalsTarget: 'organization', unwindData: false })),
    utils.aggregateTotals(_.assign({}, options, { totalsTarget: 'channels', unwindData: false })),
    generateSliderCharts(queries.getData(options), options)
  ])
  .then(data => {
    data[2].totals = _.assign(data[2].totals, { organization: utils.getTotals(data[0], options), channels: utils.getTotals(data[1], options) });

    return data[2];
  });
}

module.exports = { getResults };
