var Device = require('../../models/device');
var Devicefeedback = require('../../models/device/devicefeedback');
var Dailydevicefeedback = require('../../models/device/dailydevicefeedback');
var utils = require('./utils');

var _ = require('lodash');
var q = require('q');
var moment = require('moment');
require('moment-range');
var mongoose = require('mongoose');


function getFeedbackAmount(query, callback){
	var range = utils.getDoubleDateRange({
		dateFrom: moment.utc(query.created_at.$gte).startOf('day').unix(),
		dateTo: moment.utc(query.created_at.$lte).startOf('day').unix()
	});

	var devices = _.map(query.device_id.$in, id => mongoose.Types.ObjectId(id));

	Dailydevicefeedback.aggregate([
		{ $match: { device_id: { $in: devices }, date: { $lte: range.dateTo, $gte: range.dateFrom } } },
		{ $project: utils.getDateSplitProject(range) },
		{ $group: { _id: { date_group: '$date_group', date: '$date' }, feedback_count: { $sum: '$feedback_count' } } }
	]).exec(function(err, aggregateObject) {
		var nowObjects = _.filter(aggregateObject, object => object._id.date_group === 1);
		var beforeObjects = _.filter(aggregateObject, object => object._id.date_group === 0);

		var totalFeedbacks = {
			now: _.reduce(nowObjects, (sum, n) => sum + n.feedback_count, 0),
			before: _.reduce(beforeObjects, (sum, n) => sum + n.feedback_count, 0)
		}

		var graph = _.map(nowObjects, object => [object._id.date * 1000, object.feedback_count]);

		var fullRange = moment.range(range.middleDate * 1000, range.dateTo * 1000);

		fullRange.by('days', (day) => {
			var unix = moment.utc(day).startOf('day').unix();

		 if(_.find(nowObjects, object => object._id.date === unix) === undefined) {
			 graph.push([unix * 1000, 0]);
		 }
		});

		graph.sort((a, b) => a[0] - b[0]);

		callback({ graph, totalFeedbacks });
	});


}

function getFbeventAmount(query, callback){
	var devices = _.map(query.device_id.$in, id => mongoose.Types.ObjectId(id));

	var range = utils.getDoubleDateRange({
		dateFrom: moment.utc(query.created_at_adjusted_ts.$gte * 1000).startOf('day').unix(),
		dateTo: moment.utc(query.created_at_adjusted_ts.$lte * 1000).endOf('day').unix()
	});

	Dailydevicefeedback.aggregate([
		{ $match: { date: { $gte: range.dateFrom, $lte: range.dateTo }, device_id: { $in: devices } } },
		{ $project: utils.getDateSplitProject(range) },
		{ $group: { _id: '$date_group', count: { $sum: '$fbevent_count' } } }
	]).exec(function(err, aggregateObject) {
		var nowObject = _.find(aggregateObject, { _id: 1 }) || { count: 0 };
		var beforeObject = _.find(aggregateObject, { _id: 0 }) || { count: 0 };

		callback({ now: nowObject.count, before: beforeObject.count });
	})

}

function getAllFeedbackAmount(query, callback){
	query.device_id.$in = _.map(query.device_id.$in, id => mongoose.Types.ObjectId(id));

	Devicefeedback.aggregate([
		{ $match: query },
		{ $group: { _id: null, count: { $sum: '$feedback_count' } } }
	]).exec(function(err, aggregateObject) {
		callback((aggregateObject[0] || {}).count || 0);
	});

}

module.exports = { getAllFeedbackAmount, getFeedbackAmount, getFbeventAmount };
