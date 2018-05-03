var _ = require('lodash');
var q = require('q');

var utils = require('../utils');
var queries = require('./database-queries');

function generateNPSChart(data, options) {
  var EMPTY_NPS_OBJECT = { '0': 0, '0.1': 0, '0.2': 0, '0.3': 0, '0.4': 0, '0.5': 0, '0.6': 0, '0.7': 0, '0.8': 0, '0.9': 0, '1': 0 };

  var dailyCounts = {};
  var hourlyCounts = {};
  var weeklyCounts = {};
  var channelGroupCounts = {};

  data.charts.nps = { daily: [], hourly: [], weekly: [], channelGroup: []};

  data.charts.daily.regular.forEach(obj => {
    obj.data.forEach(count => {
      dailyCounts[count[0].toString()] = dailyCounts[count[0].toString()] || _.assign({}, EMPTY_NPS_OBJECT);
      dailyCounts[count[0].toString()][obj.name.toString()] += count[1];
    });
  });

  data.charts.hourly.regular.forEach(obj => {
    obj.data.forEach(count => {
      hourlyCounts[count[0].toString()] = hourlyCounts[count[0].toString()] || _.assign({}, EMPTY_NPS_OBJECT);
      hourlyCounts[count[0].toString()][obj.name.toString()] += count[1];
    });
  });

  data.charts.weekly.regular.forEach(obj => {
    obj.data.forEach(count => {
      weeklyCounts[count[0].toString()] = weeklyCounts[count[0].toString()] || _.assign({}, EMPTY_NPS_OBJECT);
      weeklyCounts[count[0].toString()][obj.name.toString()] += count[1];
    });
  });

  data.charts.channelGroup.regular.forEach(obj => {
    obj.data.forEach(count => {
      channelGroupCounts[count[0].toString()] = channelGroupCounts[count[0].toString()] || _.assign({}, EMPTY_NPS_OBJECT);
      channelGroupCounts[count[0].toString()][obj.name.toString()] += count[1];
    });
  });


  for(var date in dailyCounts) {
    data.charts.nps.daily.push([parseInt(date), utils.calculateNps(dailyCounts[date])]);
    data.charts.nps.daily.sort((a,b) => a[0] - b[0]);
  }

  for(var hour in hourlyCounts) {
    data.charts.nps.hourly.push([parseInt(hour), utils.calculateNps(hourlyCounts[hour])]);
    data.charts.nps.hourly.sort((a,b) => a[0] - b[0]);
  }

  for(var week in weeklyCounts) {
    data.charts.nps.weekly.push([parseInt(week), utils.calculateNps(weeklyCounts[week])]);
    data.charts.nps.weekly.sort((a,b) => a[0] - b[0]);
  }


  for(var channel in channelGroupCounts) {
    data.charts.nps.channelGroup.push([channel ,utils.calculateNps(channelGroupCounts[channel])]);
    data.charts.nps.channelGroup.sort((a,b) => a[0] - b[0]);
  }

  return data;
}

function getTotals(data) {
  var now = _.filter(data, obj => obj._id.date_group === 1);
  var before = _.filter(data, obj => obj._id.date_group === 0);
  var nowCount = 0;
  var nowNps = {};

  now.forEach(row => {

    nowNps[row._id.value.value.toString()] = nowNps[row._id.value.value.toString()] || 0;
    nowNps[row._id.value.value.toString()] += row.count;

    nowCount += row.count;
  });

  var beforeCount = 0;
  var beforeNps = {};

  before.forEach(row => {
    beforeNps[row._id.value.value.toString()] = beforeNps[row._id.value.value.toString()] || 0;
    beforeNps[row._id.value.value.toString()] += row.count;
    beforeCount += row.count;
  });

  return { now: { count: nowCount, nps: _.round(utils.calculateNps(nowNps)) }, before: { count: beforeCount, nps: _.round(utils.calculateNps(beforeNps)) } };
}

function getResults(options) {
  var group = {
    _id: { date_group: '$date_group', value: '$data' },
    count: { $sum: 1 }
  }

  return q.all([
    utils.aggregateTotals(_.assign({}, options, { totalsTarget: 'organization', group: group })),
    utils.aggregateTotals(_.assign({}, options, { totalsTarget: 'channels', group: group })),
    queries.getData(options)
      .then(data => utils.generateCountCharts(data, options))
      .then(data => generateNPSChart(data, options)),
    utils.getDevices(options)
  ])
  .then(data => {
    data[2].channelList = data[3];
    data[2].totals = _.assign({}, data[2].totals, { organization: getTotals(data[0]), channels: getTotals(data[1]) });
    return data[2];
  });
}

module.exports = { getResults };
