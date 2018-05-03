/*

data: data generated from hourly { _id: { date: 1486598400, data: 1 }, fbevent_count: 1 }
options: {
  legend,
  values,
  dateFrom,
  dateTo,
  includeAverage,
}

*/

var _ = require('lodash')
var moment = require('moment')
require('moment-range')

function createEmptyDayObject(from, to, initialValue) {
  var obj = {};

  var range = moment.range(moment.utc(from), moment.utc(to));

  range.by('days', day => {
    obj[(day.unix()).toString()] = typeof initialValue === 'object' ? _.assign({}, initialValue) : initialValue;
  });

  return obj;
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

function generateDailyRegularChart(key, data, legend) {
  var chart = { name: legend[key] || key, data: [] };

  for(var date in data[key].daily) {
    chart.data.push([parseInt(date) * 1000, data[key].daily[date] || 0]);
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

function generateDailyNormalizedChart(key, data, dailyTotalsData, legend) {
  var chart = { name: legend[key] || key, data: [] };

  for(var date in data[key].daily) {
    var share = _.round((data[key].daily[date] || 0) / (dailyTotalsData[date] || 1), 4) * 100

    chart.data.push([parseInt(date) * 1000, share]);
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

function generateDailyAverageChart(dailyAverageData) {
  var chart = { name: '', data: [] };

  for(var date in dailyAverageData) {
    var targetDate = dailyAverageData[date];
    var average = targetDate.count === 0 ? null : _.round(targetDate.sum / targetDate.count, 4);

    chart.data.push([parseInt(date) * 1000, average]);
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



function generateCountChartsFromHourly(data, options) {
  var resultData = {};
  var dailyTotalsData = {};
  var hourlyTotalsData = {};
  var hourlyAverageData = {};
  var dailyAverageData = {};
  var weekdayTotalsData = {}
  var weekdayAverageData = {}

  var totalsData = { total: 0, data: {}, sum: 0 };
  var legend = options.legend || {};

  options.values.forEach(value => {
    totalsData.data[value.toString()] = 0;
    resultData[value.toString()] = { daily: createEmptyDayObject(options.dateFrom, options.dateTo, 0), hourly: {}, weekday: {} };
  });

  if(options.includeAverage) {
    hourlyAverageData = {};
    dailyAverageData = createEmptyDayObject(options.dateFrom, options.dateTo, { count: 0, sum: 0 });
    weekdayAverageData = {}
  }

  data.forEach(object => {
    try {
      if(_.isEmpty(resultData[object._id.data])) return;

      resultData[object._id.data.toString()] = resultData[object._id.data.toString()] || { daily: createEmptyDayObject(options.dateFrom, options.dateTo, 0), hourly: {}, weekday: {} };
      totalsData.data[object._id.data.toString()] = totalsData.data[object._id.data.toString()] || 0;

      var targetResultData = resultData[object._id.data.toString()];

      var day = moment.utc(object._id.date * 1000).startOf('day').unix();
      var hour = moment.utc(object._id.date * 1000).get('hours');
      var weekday = moment.utc(object._id.date * 1000).isoWeekday()

      if(options.includeAverage) {
        var targetHourlyAverage = hourlyAverageData[hour.toString()] || { count: 0, sum: 0 };
        var targetDailyAverage = dailyAverageData[day.toString()];
        var targetWeekdayAverage = weekdayAverageData[weekday.toString()] || {count: 0, sum: 0}

        var dataValue = parseFloat(object._id.data);

        if(!isNaN(dataValue)) {
          targetHourlyAverage.count += object.fbevent_count;
          targetHourlyAverage.sum += (dataValue * object.fbevent_count);

          targetDailyAverage.count += object.fbevent_count;
          targetDailyAverage.sum += (dataValue * object.fbevent_count);

          targetWeekdayAverage.count += object.fbevent_count;
          targetWeekdayAverage.sum += (dataValue * object.fbevent_count);

          totalsData.sum += dataValue
        }

        hourlyAverageData[hour.toString()] = _.assign({}, targetHourlyAverage);
        weekdayAverageData[weekday.toString()] = _.assign({}, targetWeekdayAverage);
      }

      dailyTotalsData[day.toString()] = (dailyTotalsData[day.toString()] || 0) + object.fbevent_count;
      hourlyTotalsData[hour.toString()] = (hourlyTotalsData[hour.toString()] || 0) + object.fbevent_count;
      weekdayTotalsData[weekday.toString()] = (weekdayTotalsData[weekday.toString() || 0]) + object.fbevent_count;

      targetResultData.daily[day.toString()] = (targetResultData.daily[day.toString()] || 0) + object.fbevent_count;
      targetResultData.hourly[hour.toString()] = (targetResultData.hourly[hour.toString()] || 0) + object.fbevent_count;
      targetResultData.weekday[weekday.toString()] = (targetResultData.weekday[weekday.toString()] || 0) + object.fbevent_count;

      totalsData.total += object.fbevent_count;
      totalsData.data[object._id.data.toString()] = (totalsData.data[object._id.data.toString()] || 0) + object.fbevent_count;
    } catch(err) {}
  });

  var charts = { daily: { regular: [], normalized: [] }, hourly: { regular: [], normalized: []}, weekday: {regular: [], normalized: []} }, pie: generatePieChart(totalsData, options.legend) };
  var totals = { regular: [], normalized: [] };

  if(options.includeAverage) {
    charts.daily.average = generateDailyAverageChart(dailyAverageData);
    charts.hourly.average = generateHourlyAverageChart(hourlyAverageData);
    charts.weekday.average = generateWeekdayAverageChart(weekdayAverageData)
  }

  for(var key in resultData) {
    totals.total = totalsData.total;
    totals.average = totalsData.total === 0 ? 0 : _.round(totalsData.sum / totalsData.total * 100);
    totals.regular.push({ name: legend[key] || key, id: key, value: totalsData.data[key] || 0 });
    totals.normalized.push({ name: legend[key] || key, id: key, value: totalsData.total == 0 ? 0 : _.round(((totalsData.data[key] || 0) / totalsData.total) * 100) });

    charts.daily.regular.push(generateDailyRegularChart(key, resultData, legend));
    charts.hourly.regular.push(generateHourlyRegularChart(key, resultData, legend));
    charts.weekday.regular.push(generateWeekdayRegularChart(key, resultData, legend));

    charts.daily.normalized.push(generateDailyNormalizedChart(key, resultData, dailyTotalsData, legend));
    charts.hourly.normalized.push(generateHourlyNormalizedChart(key, resultData, hourlyTotalsData, legend));
    charts.weekday.normalized.push(generateWeekdayNormalizedChart(key, resultData, weekdayTotalsData, legend));

  }

  return { charts, totals };
}

module.exports = {generateCountChartsFromHourly}
