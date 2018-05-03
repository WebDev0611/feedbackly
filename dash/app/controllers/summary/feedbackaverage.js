'use strict';

var Fbevent = require('../../models/fbevent');
var Feedback = require('../../models/feedback');
var Devicefeedback = require('../../models/device/devicefeedback');
var Dailydevicefeedback = require('../../models/device/dailydevicefeedback');
var Device = require('../../models/device');
var utils = require('./utils');

var _ = require('lodash');
var q = require('q');
var moment = require('moment');
require('moment-range');
var mongoose = require('mongoose');
var Promise = require('bluebird')

function getFeedbackAverageByDay(query, callback){
	var dateFrom = moment.utc(query.created_at.$gte).startOf('day').unix();
	var dateTo = moment.utc(query.created_at.$lte).startOf('day').unix();
	var devices = _.map(query.device_id.$in, id => mongoose.Types.ObjectId(id));

	var range = utils.getDoubleDateRange({ dateFrom, dateTo });

	return Dailydevicefeedback.aggregate([
		{ $match: { device_id: { $in: devices }, date: { $lte: range.dateTo, $gte: range.dateFrom } } },
		{ $project: utils.getDateSplitProject(range) },
		{ $group: { _id: { date_group: '$date_group', date: '$date' }, num_count: { $sum: '$num_count' }, num_sum: { $sum: '$num_sum' } } }
	]).exec()
		.then(aggregateObject => {
			var nowObject = { num_sum: 0, num_count: 0 };
			var beforeObject = { num_sum: 0, num_count: 0 };

			aggregateObject.forEach(object => {
				if(object._id.date_group === 1) {
					nowObject.num_sum += (object.num_sum || 0);
					nowObject.num_count += (object.num_count || 0);
				} else {
					beforeObject.num_sum += (object.num_sum || 0);
					beforeObject.num_count += (object.num_count || 0);
				}
			});

			var average = {
				now: _.round(nowObject.num_count === 0 ? 0 : nowObject.num_sum / nowObject.num_count * 100),
				before: _.round(beforeObject.num_count === 0 ? 0 : beforeObject.num_sum / beforeObject.num_count * 100)
			};

			var graph = _.chain(aggregateObject).filter(object => object._id.date_group === 1).map(object => [object._id.date * 1000, object.num_count == 0 ? 0 : object.num_sum / object.num_count * 100]).value();

			var fullRange = moment.range(range.middleDate * 1000, range.dateTo * 1000);

			fullRange.by('days', (day) => {
				var unix = moment.utc(day).startOf('day').unix();

				 if(_.find(_.filter(aggregateObject, object => object._id.date_group === 1), object => object._id.date === unix) === undefined) {
					 graph.push([unix * 1000, null]);
				 }
			});

			graph.sort((a, b) => a[0] - b[0]);

			var filteredValues = _.chain(aggregateObject).filter(obj => obj.num_count > 0).map(obj => [obj._id.date * 1000, obj.num_count == 0 ? 0 : obj.num_sum / obj.num_count * 100]).value();

			var bestDay = _.maxBy(filteredValues, obj => obj[1]);
			var worstDay = _.minBy(filteredValues, obj => obj[1])

			return { graph, worstDay, bestDay, average }
	});
}


function getFeedbackAverageByHour(query, callback){
	var dateFrom = moment.utc(query.created_at_adjusted_ts.$gte * 1000).startOf('day').unix();
	var dateTo = moment.utc(query.created_at_adjusted_ts.$lte * 1000).startOf('day').unix();
	var devices = _.map(query.device_id.$in, id => mongoose.Types.ObjectId(id));

	return Dailydevicefeedback.aggregate([
		{ $match: { device_id: { $in: devices }, date: { $lte: dateTo, $gte: dateFrom } } },
		{ $group: { _id: '$hour', num_count: { $sum: '$num_count' }, num_sum: { $sum: '$num_sum' }, fbevent_count: { $sum: '$fbevent_count'} } }
	]).exec()
		.then(aggregateObject => {
			var graph = _.map(aggregateObject, object => [object._id, object.num_count == 0 ? 0 : _.round(object.num_sum / object.num_count * 100), object.fbevent_count]);

			graph.sort((a, b) => a[0] - b[0]);

			var bestHour = _.maxBy(graph, obj => obj[1]);
			var worstHour = _.minBy(graph, obj => obj[1]);

			return { graph, bestHour, worstHour };
		});
}

function getOverallNPS(query, callback){
	query.question_type = 'NPS';

	var range = utils.getDoubleDateRange({
		dateFrom: query.dateFrom,
		dateTo: query.dateTo
	});

	var devices = _.map(query.devices, device => mongoose.Types.ObjectId(device._id));

	// TODO: organization id

	const pipeline = [
		{ $match: { device_id: { $in: devices }, created_at_adjusted_ts: { $lte: range.dateTo, $gte: range.dateFrom }, "data.question_type": 'NPS' } },
		{ $unwind: '$data' },
		{ $match: {"data.question_type": "NPS"}},
		{ $project: utils.getDateSplitProject(_.assign({}, range, { dateField: 'created_at_adjusted_ts' })) },
		{ $group: { _id: { data: '$data.value', date_group: '$date_group' }, count: { $sum: 1 } } }
	]
	Feedback.aggregate(pipeline).exec(function(err, aggregateObject) {
		var npsObject = { detractors: 0, passives: 0, promoters: 0, total: 0 };
		var now = _.assign({}, npsObject);
		var before = _.assign({}, npsObject);

		aggregateObject.forEach(function(npsValue) {
			var value = parseFloat(npsValue._id.data);
			var targetObject = npsValue._id.date_group === 1 ? now : before;

			targetObject.total += npsValue.count;


			if(value <= 0.6) {
				targetObject.detractors += npsValue.count;
			} else if(value == 0.7 || value == 0.8) {
				targetObject.passives += npsValue.count;
			} else if(value == 0.9 || value == 1) {
				targetObject.promoters += npsValue.count;
			} else {
				targetObject.total -= npsValue.count;
			}
		});

		var calculateNps = obj => obj.total === 0 ? 0 : _.round(100 * (-obj.detractors/obj.total + obj.promoters/obj.total));

		callback({ now: calculateNps(now), before: calculateNps(before) });
	});
}

function getOrganizationAverage(options) {
	var deferred = q.defer();

	var range = utils.getDoubleDateRange(options);

	var organizationId = options.organizationId;

	Device.find({ organization_id: organizationId }, function(err, devices) {
		var deviceIds = _.map(devices, device => mongoose.Types.ObjectId(device._id));
		var match = { device_id: { $in: deviceIds }, date: { $gte: range.dateFrom, $lte: range.dateTo } };

		Dailydevicefeedback.aggregate([
			{ $match: match },
			{ $project: utils.getDateSplitProject(range) },
			{ $group: { _id: '$date_group', num_sum: { $sum: '$num_sum' }, num_count: { $sum: '$num_count' } } }
		]).exec(function(err, aggregateObject) {
			if(err) {
				deferred.reject();
			} else {
				var nowObject = _.find(aggregateObject, { _id: 1 }) || { num_count: 0 };
				var beforeObject = _.find(aggregateObject, {_id: 0 }) || { num_count: 0 };

				var now = _.round(nowObject.num_count === 0 ? 0 : nowObject.num_sum / nowObject.num_count * 100);
				var before = _.round(beforeObject.num_count === 0 ? 0 : beforeObject.num_sum / beforeObject.num_count * 100);

				deferred.resolve({ now, before });
			}
		});
	});

	return deferred.promise;
}



function getBestDevicesByAverage(options) {
	var deferred = q.defer();

	var dateFrom = moment.utc(options.dateFrom * 1000).startOf('day').unix();
	var dateTo = moment.utc(options.dateTo * 1000).startOf('day').unix();
	var organizationId = options.organizationId;

	Device.find({ organization_id: organizationId }, { _id: 1, name: 1 }, function(err, devices) {
		var deviceIdToName = {};

		var deviceIds = _.map(devices, device => {
			deviceIdToName[device._id] = device.name;

			return mongoose.Types.ObjectId(device._id)
		});

		var match1 = { organization_id: mongoose.Types.ObjectId(organizationId), device_id: { $in: deviceIds }, created_at: { $gte: moment.utc(dateFrom*1000).toDate(), $lte: moment.utc(dateTo*1000).endOf('day').toDate() } };
		var match2 = { device_id: { $in: deviceIds }, date: { $gte: dateFrom, $lte: dateTo } };

		const pipeline1 = [
			{$match: match1},
			{$group: {_id: {feedback_id: "$_id", device_id: "$device_id"}}},
			{$group: {_id: {device_id: "$_id.device_id"}, sum: {$sum: 1}}}
		]

		var p1 = Feedback.aggregate(pipeline1);

		var p2 = Dailydevicefeedback.aggregate([
			{ $match: match2 },
			{ $group: { _id: '$device_id', num_sum: { $sum: '$num_sum' }, num_count: { $sum: '$num_count' }, fbevent_count: { $sum: '$fbevent_count' } } },
			{
				$project: {
					num_average: { $cond: [{ $eq: ['$num_count', 0] }, 0, { $divide: ['$num_sum', '$num_count'] }] },
					device_id: 1,
					num_count: '$num_count',
					fbevent_count: '$fbevent_count'
				}
			},
			{ $sort: { num_average: -1 } },
		]);

		Promise.all([p1, p2])
		.spread((sum, aggregateObject) => {
				if(devices.length > aggregateObject.length) {
					devices.forEach(device => {
						if(!_.find(aggregateObject, { _id: device._id })) {
							aggregateObject.push({ _id: device._id, num_average: 0, num_count: 0, fbevent_count: 0 });
						}
					});
				}


				var top = _.map(aggregateObject, object => {
					var count = _.find(sum, {"_id": {device_id: object._id}})
					return { name: deviceIdToName[object._id], average: _.round(object.num_average * 100), fbevent_count: object.fbevent_count, count: _.get(count, 'sum') || 0 }
				})
				top = _.filter(top, t => {return t.count > 0})

				if(top.length < 4) {
					deferred.resolve({ top: top });
				} else {
					var quartile = Math.floor(top.length / 4) - 1;

					var highQuartile = aggregateObject[quartile]
					var lowQuartile = aggregateObject[top.length - 1 - quartile]

					deferred.resolve({ top: top, highQuartile: { name: deviceIdToName[highQuartile._id], average: _.round(highQuartile.num_average * 100) }, lowQuartile: { name: deviceIdToName[lowQuartile._id], average: _.round(lowQuartile.num_average * 100) } });
				}

		})
		.catch(err => {
			console.log(err);
			deferred.reject();
		})

	});

	return deferred.promise;
}

function getBest(averageObject){
	var sorted = _.sortBy(averageObject, function(dayObj){
		if(dayObj[1] != null) return dayObj[1]
		else return -1;
	});
	var element = sorted.pop();
	if(element && element[1] > 0) return element;
	else return null;
}

function getWorst(averageObject){
	var sorted = _.sortBy(averageObject, function(dayObj){
		if(dayObj[1] != null) return dayObj[1]
		else return 2;
	});
	var element = sorted.shift();
	var lastelement = sorted.pop()
	if(element && lastelement && element[1] != lastelement[1]) return element;
	else return null;
}

module.exports = { getBest, getWorst, getOverallNPS, getFeedbackAverageByDay, getFeedbackAverageByHour, getOrganizationAverage, getBestDevicesByAverage };
