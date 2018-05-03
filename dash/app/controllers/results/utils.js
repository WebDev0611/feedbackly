'use strict';

var Fbevent = require('../../models/fbevent');
var Feedback = require('../../models/feedback');
var Device = require('../../models/device/index');
var mongoose = require('mongoose');
var moment = require('moment');
require('moment-range');
var _ = require('lodash');

function attachFbeventLimitToQuery(maxCount) {
  return target => {
    if(maxCount) {
      return _.assign({}, target,  { period_sequence: { $lt: maxCount } });
    } else {
      return target;
    }
  }
}

function calculateNps(data) {
  var detractors = 0, passives = 0, promoters = 0, total = 0;

  for(var val in data) {
    var value = parseFloat(val);
    var count = parseInt(data[val]);

    total += count;

    if(value <= 0.6) {
      detractors += count;
    } else if(value == 0.7 || value == 0.8) {
      passives += count;
    } else if(value == 0.9 || value == 1) {
      promoters += count;
    } else {
      total -= count;
    }
  }

  var nps = 0;

  if(total != 0) {
    nps = 100 * (-detractors/total + promoters/total);
  }

  return nps;
}

function getTotals(data, options) {
  var countBefore = _.find(data, { _id: 0 }) || { count: 0 };
  var countNow = _.find(data, { _id: 1 }) || { count: 0 };

  var totals = { now: {}, before: {} };

  totals.now.count = countNow.count;

  if(options.includeAverage === true) {
    totals.now.average = countNow.count > 0 ? _.round(countNow.sum / countNow.count * 100) : 0;
  }

  totals.before.count = countBefore.count;

  if(options.includeAverage === true) {
    totals.before.average = countBefore.count > 0 ? _.round(countBefore.sum / countBefore.count * 100) : 0;
  }

  return totals;
}


const aggregateTotals = async(options) => {
  var middleDate = moment.utc(options.dateFrom).startOf('day').unix();

  var dateTo = moment.utc(options.dateTo).add(1, 'days').unix();
  var difference = dateTo - moment.utc(options.dateFrom).startOf('day').unix();
  var dateFrom = moment.utc((middleDate - difference) * 1000).unix();
  var organizationId = mongoose.Types.ObjectId(options.organizationId);
  var deviceId = _.map(options.deviceId, id => mongoose.Types.ObjectId(id));
  var questionId = mongoose.Types.ObjectId(options.questionId);

  // Feedback
  var match = attachFbeventLimitToQuery(options.responseLimit)({
    created_at_adjusted_ts: {
      $gte: dateFrom,
      $lt: dateTo
    }
  });

  if(options.totalsTarget !== 'organization') {
    match.device_id = { $in: deviceId };
  }

  if(!_.isEmpty(options.feedbacks)) {
    match = addFilters(match, options, questionId)
  } else {
    match["data.question_id"]=questionId
  }

  var group = {
    _id: '$date_group',
    count: { $sum: 1 }
  };

  if(options.group !== undefined) {
    group = options.group;
  }

  if(options.includeAverage) {
    group.sum = { $sum: "$data.value"}
  }

  var project = {
    data: '$data',
    date_group: {
      $cond: { if: { $gte: ['$created_at_adjusted_ts', middleDate] }, then: 1, else: 0 }
    }
  };

  /* const skipAndLimit= (opt)=>{

  } */

  var aggregation = [
    { $match: match },
    { $unwind: '$data' },
    { $match: {"data.question_id": questionId}},
    { $project: project },
    { $group: group },
  ];

  if(options.unwindData === false) {
    aggregation = [
      { $match: match },
      { $project: project },
      { $group: group },

    ]
  }
  const data = await Feedback.aggregate(aggregation).exec();
  return data;
}

const aggregateHourlyCounts =  async (options) => {
  var type = options.type;
  var dateFrom = moment.utc(options.dateFrom).startOf('day').unix();
  var dateTo = moment.utc(options.dateTo).add(1, 'days').unix();
  var questionId = mongoose.Types.ObjectId(options.questionId);
  var deviceId = _.map(options.deviceId, id => mongoose.Types.ObjectId(id));
  var surveyId = _.map(options.surveyId, id => mongoose.Types.ObjectId(id));
  var organizationId = options.organizationId ? mongoose.Types.ObjectId(organizationId) : null;

  var match = attachFbeventLimitToQuery(options.responseLimit)({
    created_at_adjusted_ts: {
      $gte: dateFrom,
      $lt: dateTo
    },
    device_id: { $in: deviceId },
    survey_id: { $in: surveyId }
  });

  if(!_.isEmpty(options.feedbacks)) {
    match = addFilters(match, options, questionId)
  } else {
    match["data.question_id"]=questionId
  }

  var moduloProject = {
    created_at_adjusted_ts: {
      to_mod: { $mod: ['$created_at_adjusted_ts', 3600] },
      original: '$created_at_adjusted_ts'
    },
    question_id: '$question_id',
    device_id: '$device_id',
    data: '$data'
  }

  var dateRoundProject = {
    created_at_adjusted_ts: {
      group_date: { $subtract: ['$created_at_adjusted_ts.original', '$created_at_adjusted_ts.to_mod'] },
      original: '$created_at_adjusted_ts.original'
    },
    question_id: '$question_id',
    device_id: '$device_id',
    data: '$data'
  }

  var group = {
    _id: { date: '$created_at_adjusted_ts.group_date', device: "$device_id", data: '$data' },
    fbevent_count: { $sum: 1 }
  }

  var aggregation = [ 
    { $match: match },
    { $unwind: '$data' },
    { $sort: { created_at_adjusted_ts: options.limitPosition === 'oldest' ? 1 : -1 } },
    { $match: {"data.question_id": questionId} },
   ];

  if (options.limitCount)  aggregation.push({$limit: options.limitCount})
  aggregation = [...aggregation, { $unwind: '$data.value' },
  { $project: moduloProject },
  { $project: dateRoundProject },
  { $group: group }]
  const data = await Feedback.aggregate(aggregation).exec();
  return data
}

function getDevices(options){
  var deviceIds = _.map(options.deviceId, id => mongoose.Types.ObjectId(id));
  return Device.find({_id: {$in: deviceIds}}, {name: 1});
}

function generateDailyRegularChart(key, data, legend) {
  var chart = { name: legend[key] || key, data: [] };

  for(var date in data[key].daily) {
    chart.data.push([parseInt(date) * 1000, data[key].daily[date] || 0]);
  }

  return chart;
}

function generateWeeklyRegularChart(key, data, legend) {
  var chart = { name: legend[key] || key, data: [] };

  for(var date in data[key].weekly) {
    chart.data.push([parseInt(date), data[key].weekly[date] || 0]);
  }

  return chart;
}

function generateHourlyRegularChart(key, data, legend) {
  var chart = { name: legend[key] || key, data: [] };

  for(var hour in data[key].hourly) {
    chart.data.push([parseInt(hour), data[key].hourly[hour] || 0]);
  }

  return chart;
}

function generateChannelGroupRegularChart(key, data, legend) {
  var chart = { name: legend[key] || key, data: [] };

  for(var channel in data[key].channelGroup) {
    chart.data.push([channel, data[key].channelGroup[channel] || 0]);
  }

  return chart;
}

function generateDailyNormalizedChart(key, data, dailyTotalsData, legend) {
  var chart = { name: legend[key] || key, data: [] };

  for(var date in data[key].daily) {
    var share = _.round((data[key].daily[date] || 0) / (dailyTotalsData[date] || 1), 4) * 100

    chart.data.push([parseInt(date) * 1000, share]);
  }

  return chart;
}

function generateWeeklyNormalizedChart(key, data, weeklyTotalsData, legend) {
  var chart = { name: legend[key] || key, data: [] };

  for(var date in data[key].weekly) {
    var share = _.round((data[key].weekly[date] || 0) / (weeklyTotalsData[date] || 1), 4) * 100

    chart.data.push([parseInt(date), share]);
  }
  return chart;
}

function generateHourlyNormalizedChart(key, data, hourlyTotalsData, legend) {
  var chart = { name: legend[key] || key, data: [] };

  for(var hour in data[key].hourly) {
    var share = _.round((data[key].hourly[hour] || 0) / (hourlyTotalsData[hour] || 1), 4) * 100

    chart.data.push([parseInt(hour), share]);
  }

  return chart;
}

function generateChannelGroupNormalizedChart(key, data, channelGroupTotalsData, legend) {
  var chart = { name: legend[key] || key, data: [] };

  for(var channel in data[key].channelGroup) {
    var share = _.round((data[key].channelGroup[channel] || 0) / (channelGroupTotalsData[channel] || 1), 4) * 100

    chart.data.push([channel, share]);
  }

  return chart;
}

function generateDailyAverageChart(dailyAverageData) {
  var chart = { name: '', data: [] };

  for(var date in dailyAverageData) {
    var targetDate = dailyAverageData[date];
    var average = targetDate.count === 0 ? null : _.round(targetDate.sum / targetDate.count, 4);

    chart.data.push([parseInt(date) * 1000, average]);
  }

  return chart;
}

function generateWeeklyAverageChart(weeklyAverageData) {
  var chart = { name: '', data: [] };

  for(var date in weeklyAverageData) {
    var targetDate = weeklyAverageData[date];
    var average = targetDate.count === 0 ? null : _.round(targetDate.sum / targetDate.count, 4);

    chart.data.push([parseInt(date), average]);
  }

  return chart;
}

function generateHourlyAverageChart(hourlyAverageData) {
  var chart = { name: '', data: [] };

  for(var hour in hourlyAverageData) {
    var targetHour = hourlyAverageData[hour];
    var average = targetHour.count === 0 ? null : _.round(targetHour.sum / targetHour.count, 4);

    chart.data.push([parseInt(hour), average]);
  }

  return chart;
}

function generateChannelGroupAverageChart(channelGroupAverageData) {
  var chart = { name: '', data: [] };

  for(var channel in channelGroupAverageData) {
    var targetChannel = channelGroupAverageData[channel];
    var average = targetChannel.count === 0 ? null : _.round(targetChannel.sum / targetChannel.count, 4);
    let arraySend = [channel, average];

    chart.data.push(arraySend);
  }
  return chart;
}

function generatePieChart(totalsData, legend) {
  var chart = { name: '', data: [] };
  var total = totalsData.total;

  for(var data in totalsData.data) {
    var share = _.round(totalsData.data[data] / (total || 1), 4);

    chart.data.push({ name: legend[data] || data, y: share });
  }

  return chart;
}

function createEmptyDayObject(from, to, initialValue) {
  var obj = {};

  var range = moment.range(moment.utc(from), moment.utc(to));

  range.by('days', day => {
    obj[(day.unix()).toString()] = typeof initialValue === 'object' ? _.assign({}, initialValue) : initialValue;
  });

  return obj;
}

function createEmptyHourObject(from, to, initialValue) {
  var obj = {};

  _.range(from, to).forEach(value => { obj[value] = typeof initialValue === 'object' ? _.assign({}, initialValue) : initialValue; });

  return obj;
}

function createEmptyWeekObject(from, to, initialValue) {
  var obj = {};

  _.range(from, to).forEach(value => { obj[value] = typeof initialValue === 'object' ? _.assign({}, initialValue) : initialValue; });

  return obj;
}

function createEmptyChannelObject(from, to, initialValue) {
  var obj = {};

  _.range(from, to).forEach(value => { obj[value] = typeof initialValue === 'object' ? _.assign({}, initialValue) : initialValue; });

  return obj;
}

function generateCountCharts(data, options) {
  var resultData = {};
  var dailyTotalsData = {};
  var weeklyTotalsData = {};
  var hourlyTotalsData = {};
  var channelGroupTotalsData = {};
  var hourlyAverageData = {};
  var dailyAverageData = {};
  var weeklyAverageData = {};
  var channelGroupAverageData = {};
  var totalsData = { total: 0, data: {}, sum: 0 };
  var legend = options.legend || {};

  options.values.forEach(value => {
    totalsData.data[value.toString()] = 0;
    resultData[value.toString()] = {
      daily: createEmptyDayObject(options.dateFrom, options.dateTo, 0),
      weekly: {"0" : 0, "1" : 0, "2" : 0, "3" : 0, "4" : 0, "5" : 0, "6" : 0,},
      hourly: {},
      channelGroup: createEmptyChannelObject(options.deviceId, 0)
    };
  });

  if(options.includeAverage) {
    channelGroupAverageData = createEmptyChannelObject(options.deviceId, 0);
    hourlyAverageData = {};
    weeklyAverageData = {};
    dailyAverageData = createEmptyDayObject(options.dateFrom, options.dateTo, { count: 0, sum: 0 });
  }

  data.forEach(object => {
    try {
      var ObjectValue = object._id.data.value;
      var Objectlength = object._id;

      if(_.isEmpty(resultData[ObjectValue])) return;

      resultData[ObjectValue.toString()] = resultData[ObjectValue.toString()] || { daily: createEmptyDayObject(options.dateFrom, options.dateTo, 0), weekly:{}, hourly: {}, channelGroup: {} };
      totalsData.data[ObjectValue.toString()] = totalsData.data[ObjectValue.toString()] || 0;
      var targetResultData = resultData[ObjectValue.toString()];
      var day     = moment.utc(object._id.date * 1000).startOf('day').unix();
      var weekday = moment.utc(object._id.date * 1000).startOf('day').weekday();
      var hour    = moment.utc(object._id.date * 1000).get('hours');
      var channel = object._id.device;

      if(options.includeAverage) {
        var targetHourlyAverage = hourlyAverageData[hour.toString()] || { count: 0, sum: 0 };
        var targetDailyAverage = dailyAverageData[day.toString()];
        var targetWeeklyAverage = weeklyAverageData[weekday.toString()] || { count: 0, sum: 0 };
        var targetChannelGroupAverage = channelGroupAverageData[channel.toString()] || { count: 0, sum: 0 };
        var dataValue = parseFloat(ObjectValue);
        if(!isNaN(dataValue)) {

          targetHourlyAverage.count += object.fbevent_count;
          targetHourlyAverage.sum += (dataValue * object.fbevent_count);

          targetDailyAverage.count += object.fbevent_count;
          targetDailyAverage.sum += (dataValue * object.fbevent_count);

          targetWeeklyAverage.count += object.fbevent_count;
          targetWeeklyAverage.sum += (dataValue * object.fbevent_count);

          targetChannelGroupAverage.count += object.fbevent_count;
          targetChannelGroupAverage.sum += (dataValue * object.fbevent_count);

          totalsData.sum += dataValue
        }

        hourlyAverageData[hour.toString()] = _.assign({}, targetHourlyAverage);
        weeklyAverageData[weekday.toString()] = _.assign({}, targetWeeklyAverage);
        channelGroupAverageData[channel.toString()] = _.assign({}, targetChannelGroupAverage);
      }

      dailyTotalsData[day.toString()] = (dailyTotalsData[day.toString()] || 0) + object.fbevent_count;
      weeklyTotalsData[weekday.toString()] = (weeklyTotalsData[weekday.toString()] || 0) + object.fbevent_count;
      hourlyTotalsData[hour.toString()] = (hourlyTotalsData[hour.toString()] || 0) + object.fbevent_count;
      channelGroupTotalsData[channel.toString()] = (channelGroupTotalsData[channel.toString()] || 0) + object.fbevent_count;

      targetResultData.daily[day.toString()] = (targetResultData.daily[day.toString()] || 0) + object.fbevent_count;
      targetResultData.weekly[weekday.toString()] = (targetResultData.weekly[weekday.toString()] || 0) + object.fbevent_count;
      targetResultData.hourly[hour.toString()] = (targetResultData.hourly[hour.toString()] || 0) + object.fbevent_count;
      targetResultData.channelGroup[channel.toString()] = (targetResultData.channelGroup[channel.toString()] || 0) + object.fbevent_count;

      totalsData.total += object.fbevent_count;
      totalsData.data[ObjectValue.toString()] = (totalsData.data[ObjectValue.toString()] || 0) + object.fbevent_count;
    } catch(err) {}
  });

  var charts = { daily: { regular: [], normalized: [] }, weekly: { regular: [], normalized: [] }, hourly: { regular: [], normalized: [] }, channelGroup: { regular: [], normalized: [] }, pie: generatePieChart(totalsData, options.legend) };
  var totals = { regular: [], normalized: [] };

  if(options.includeAverage) {
    charts.daily.average = generateDailyAverageChart(dailyAverageData);
    charts.weekly.average = generateWeeklyAverageChart(weeklyAverageData);
    charts.hourly.average = generateHourlyAverageChart(hourlyAverageData);
    charts.channelGroup.average = generateChannelGroupAverageChart(channelGroupAverageData);
  }

  for(var key in resultData) {
    totals.total = totalsData.total;
    totals.average = totalsData.total === 0 ? 0 : _.round(totalsData.sum / totalsData.total * 100);
    totals.regular.push({ name: legend[key] || key, id: key, value: totalsData.data[key] || 0 });
    totals.normalized.push({ name: legend[key] || key, id: key, value: totalsData.total == 0 ? 0 : _.round(((totalsData.data[key] || 0) / totalsData.total) * 100) });

    charts.daily.regular.push(generateDailyRegularChart(key, resultData, legend));
    charts.weekly.regular.push(generateWeeklyRegularChart(key, resultData, legend));
    charts.hourly.regular.push(generateHourlyRegularChart(key, resultData, legend));
    charts.channelGroup.regular.push(generateChannelGroupRegularChart(key, resultData, legend));

    charts.daily.normalized.push(generateDailyNormalizedChart(key, resultData, dailyTotalsData, legend));
    charts.weekly.normalized.push(generateWeeklyNormalizedChart(key, resultData, weeklyTotalsData, legend));
    charts.hourly.normalized.push(generateHourlyNormalizedChart(key, resultData, hourlyTotalsData, legend));
    charts.channelGroup.normalized.push(generateChannelGroupNormalizedChart(key, resultData, channelGroupTotalsData, legend));
  }

  return { charts, totals };
}

function dateCompareFormat(datetime){
  return datetime.format('YYYY-MM-DD');
};

function createEmptyChannelObject(channels, initialValue) {
  var obj = {};

  channels.forEach(channel => {
    obj[channel] = initialValue;
  });

  return obj;
}

function addFilters(originalQuery, options, questionId){
  var query = Object.assign({},originalQuery)
  query.$and = [{data: {$elemMatch: {question_id: questionId}}}]
  // TODO! add metadata here
  _.forEach(options.feedbacks, (val, key) => {
    query.$and.push({data: {$elemMatch: {value: val, question_id: mongoose.Types.ObjectId(key)}}})
  })
  return query
}

module.exports = { aggregateHourlyCounts, dateCompareFormat, generateCountCharts, attachFbeventLimitToQuery, createEmptyDayObject, getTotals, aggregateTotals, calculateNps, getDevices, addFilters };
