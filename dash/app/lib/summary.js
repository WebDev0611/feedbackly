'use strict';

// this means dashboard summary

var auth = require('../lib/auth');
var _ = require('lodash');
var moment = require('moment');
var mongoose = require('mongoose');
var async = require( 'async' );
var UserDevices = require('../models/userdevices');
var Fbevent = require('../models/fbevent');
var Feedback = require('../models/feedback');

var Summary = function() {

	var self = this;

	this.getUserData = function(user, params, cb){
        self.params = params;


		var query = {
			created_at: {
				$gte: params.from,
				$lte: params.to
			},
			organization_id: user.organization_id
		};



		// Fetch data, always passing the results as parameter to next function
		async.waterfall([
			function userDevices(callback){
				UserDevices.getUserDevices(user, function(devices){
					callback(null, devices);
				});
			},

            function fbEvents(devices, callback){
				query.device_id = {$in: devices};

				console.log(query);
				var dbreq = Fbevent.find(query);
				dbreq.exec(function(err, dbobj) {
					if (err) {
						console.log('DB ERROR: ', err);
					} else {
						console.log("the length is: " + dbobj.length);
						var data = configureData(dbobj); // Data for drawing graphs
						data.dates = {from: params.from, to: params.to}
						callback(null, data, devices);
					}
				});
			},
            function feedbackCount(data, devices, callback){
                var q = {organization_id:user.organization_id, device_id: {$in: devices}};
                Feedback.count(q, function( err, count){
                    data.totalFeedbackCount = count;
                    callback(null, data);
                });
            },
        ], function (err, result) {
			cb(result);
		});
	};


	// PRIVATE
	var configureData = function(fbevents) {
		var data = {};
		var previousRange = [ moment(self.params.from).subtract(self.dateRange+1, 'day'), moment(self.params.from).subtract(1, 'day')];
		var presentRange = [moment(self.params.from), moment(self.params.to)];
		var daysAndHours = getCountAndAverageFromFbevents(fbevents, presentRange);
		data.days = daysAndHours[0];
		data.hours = daysAndHours[1];
		data.charts = formatDataForCharts(data.days, presentRange);
		data.previousFullAverage = getFullAverage(data.days, previousRange[0], previousRange[1]);
		data.presentFullAverage = getFullAverage(data.days, presentRange[0], presentRange[1]);
		data.differenceInAverages = calculateAverageDiff(data.previousFullAverage, data.presentFullAverage);
		data.previousFbeventCount = getFbEventCount(data.days, previousRange[0], previousRange[1]);
		data.currentFbeventCount = getFbEventCount(data.days, presentRange[0], presentRange[1]);
        data.periodFeedbackCount = getFeedbackCount(data.days, presentRange[0], presentRange[1]);
        data.fbEventChange = calculateFeedbackChange(data.previousFeedbackCount, data.currentFeedbackCount);
		data.hourStats = getHourStats(data.hours);
		data.dayStats = getDayStats(data.days, presentRange[0], presentRange[1]);
        data.chartOpts = { data: convertToFlot(data.charts.averageChart), data2: data.charts.totalChart};  // others to follow
        data.flotOptions = flotOptions(presentRange);
        return data;
	};

	var formatDataForCharts = function(days, presentRange){
		var avgChartData = {"key": "avgChart", "values": []};
		var totalChartData = {"key": "totalChart", "values": []};
        var daysInArr = [];
		_.forEach(days, function(data, day){
			var dayInt = parseInt(day);
			if (dayInt/1000 >= moment().startOf('day').subtract(self.dateRange, 'days').unix()){
				// get only chart from the last week
				avgChartData.values.push([dayInt, data.average]);
				totalChartData.values.push([dayInt, data.feedbacks]);
                daysInArr.push(moment(dayInt).format("DDMMYYYY"));
			}
		});
        // next, fill in blanks
        for(var i=presentRange[0].unix(); i <= presentRange[1].unix(); i+=60*60*24){
            if(daysInArr.indexOf(moment(i*1000).format("DDMMYYYY")) == -1){
                    totalChartData.values.push([i*1000, 0]);
            }
        }
        // sort the values
		var vals = avgChartData.values;
		avgChartData.values = _.sortBy(vals, function(elem){ return elem[0];});
        vals = totalChartData.values;
        totalChartData.values = _.sortBy(vals, function(elem){ return elem[0];});
		return {averageChart: [avgChartData], totalChart: [totalChartData]};
	};

	var getCountAndAverageFromFbevents = function(fbevents, presentRange){
		var days = {};
		var hours = {};
		for (var i=0; i< 24; i++){
			hours[i] = {totalCount: 0, averageCount:0, average:0, hour: i};
		}
		_.forEach(fbevents, function(fbevent){

			var time = moment.utc(fbevent.created_at);
		    time = time.add(fbevent.offset, 'hours');
			var dayInUnix = time.startOf('day').unix()*1000;
			var hour = time.hour();
			var avg = getIndividualAverage(fbevent);
			if (_.has(days, dayInUnix)){
				if (avg) {
					days[dayInUnix].average= (days[dayInUnix].average*days[dayInUnix].averageCount+avg)/(days[dayInUnix].averageCount+1);
					days[dayInUnix].averageCount++;
				}
				days[dayInUnix].totalCount += 1;
                if(fbevent.feedback_id) days[dayInUnix].feedbacks.push(fbevent.feedback_id.toString());
			}
			else {
                var fbid;
                if(fbevent.feedback_id) fbid=fbevent.feedback_id.toString();
				days[dayInUnix] = {totalCount: 1, averageCount:0, average:0, day: dayInUnix, feedbacks: [fbid]};
				if (avg){
					days[dayInUnix].averageCount = 1;
					days[dayInUnix].average = avg;
				}
			}
			// HOURS
			if (dayInUnix/1000 >= presentRange[0].unix() && dayInUnix/1000 <= presentRange[1].unix()) {
				if (avg) {
					hours[hour].average = (hours[hour].average * hours[hour].averageCount + avg) / (hours[hour].averageCount + 1);
					hours[hour].averageCount++;
				}
				hours[hour].totalCount++;
			}
		});
        _.forEach(days, function(day){
            day.feedbacks = _.uniq(day.feedbacks).length;
        });


        return [days, hours];
	};

	var getIndividualAverage = function (fbevent) {
		if (_.indexOf(['Button', 'Slider'], fbevent.question_type) > -1) {
			var i = 0;
			var average = 0;
			_.forEach(fbevent.data, function (data) {
				i++;
				average = (parseFloat(data) + average*(i-1)) / i;
			});
			return average;
		} else {
			return false;
		}
	};

	var getFullAverage = function(data, minDate, maxDate){
		var minDateUnix = minDate.unix();
		var maxDateUnix = maxDate.unix();
		var runningAverage = { average: 0, count: 0};
		_.forEach(data, function(obj, dayKey){
			var dayUnix = dayKey/1000;
			if (dayUnix >= minDateUnix && dayUnix <= maxDateUnix){
				if (runningAverage.count > 0){
					runningAverage.average = (runningAverage.average * runningAverage.count + obj.average * obj.averageCount)/(runningAverage.count+obj.averageCount);
					runningAverage.count += obj.averageCount;
				}
				else {
					runningAverage.average = obj.average;
					runningAverage.count = obj.averageCount;
				}
			}
		});
		return runningAverage;
	};

	var getFbEventCount = function(data, minDate, maxDate){
		var minDateUnix = minDate.unix();
		var maxDateUnix = maxDate.unix();
		var count = 0;
		_.forEach(data, function(obj, dayKey){
			var dayUnix = dayKey/1000;
			if (dayUnix >= minDateUnix && dayUnix <= maxDateUnix){
				count += obj.totalCount;
			}
		  });
		return count;
	};

    var getFeedbackCount = function(data, minDate, maxDate){
        var minDateUnix = minDate.unix();
        var maxDateUnix = maxDate.unix();
        var count = 0;
        _.forEach(data, function(obj, dayKey){
            var dayUnix = dayKey/1000;
            if (dayUnix >= minDateUnix && dayUnix <= maxDateUnix){
                count += obj.feedbacks;
            }
        });
        return count;
    };


	var calculateAverageDiff = function(oldAvg, newAvg){
		return (newAvg.average-oldAvg.average)/oldAvg.average;
	};

	var calculateFeedbackChange = function(oldCount, newCount){
		if (oldCount === 0){
			return false;
		}
		return (newCount/oldCount-1)*100;
	};

	var getHourStats = function(hours){
		var stats = {};
		stats.bestAverage = _.sortBy( _.filter(hours, function(num) { return num.averageCount > 0; }), 'average').reverse()[0];
		stats.mostFeedback = _.sortBy( _.filter(hours, function(num) { return num.totalCount > 0; }), 'feedbacks').reverse()[0];
		stats.worstAverage = _.sortBy( _.filter(hours, function(num) { return num.averageCount > 0; }), 'average')[0];
		stats.leastFeedback = _.sortBy( _.filter(hours, function(num) { return num.totalCount > 0; }), 'feedbacks')[0];
		return stats;
	};

	var getDayStats = function(days, minDate, maxDate){
		var stats = {};
		var filteredDays = _.filter(days, function(num) { return num.day/1000 >= minDate.unix() && num.day/1000 <= maxDate.unix() && num.totalCount > 0;});
		stats.filteredDays = filteredDays;
        stats.mostFeedback = _.sortBy(filteredDays, 'feedbacks').reverse()[0];
		stats.leastFeedback = _.sortBy(filteredDays, 'feedbacks')[0];
		filteredDays = _.filter(filteredDays, function(num) { return num.averageCount > 0;});
		stats.bestAverage = _.sortBy(filteredDays, 'average').reverse()[0];
		stats.worstAverage = _.sortBy(filteredDays, 'average')[0];
		return stats;
	};

    var convertToFlot = function(chart){
        var data = chart[0].values;
        if(data.length > 0){
            var hack = moment(self.params.to).add(1, 'day').unix()*1000;
            data.push([hack, data[data.length-1][1]]);
        }
        var flotAvg = [
            {data: data, curvedLines: {apply: true }, color: 'rgb(154, 202, 230)'},
            {data: data, points: {show: true, radius: 4}, lines:{show:false}, color: 'rgb(154, 202, 230)'}
        ];
        return flotAvg;
    };

    var flotOptions = function(range){
        var options = {
            xaxis: {
                mode: "time",
                timeformat: "%d.%m.",
                min: range[0].unix()*1000,
                max: range[1].unix()*1000 + 2*60*60*1000,
                tickLength: 0
            },
            series: {
                lines: { show: true, fill:true, lineWidth:5 },
                curvedLines: {
                    active: true,
                    nrSplinePoints: 20
                }
            },
            legend: {
                show: false
            },
            grid: {
                borderWidth: 0
            },
            yaxis: {
                ticks:3,
                min:0,
                max:1
            }
        }
        return options;
    }

	return this;
};

module.exports = new Summary();
