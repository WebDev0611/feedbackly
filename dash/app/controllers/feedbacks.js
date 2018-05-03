'use strict';
var auth = require('../lib/auth');
var render = require('../lib/render');
var summary = require('../lib/summary');
var _ = require('lodash');
var moment = require('moment');
var mongoose = require('mongoose');
var async = require('async');
var results = require('./results');

var Survey = require('../models/survey');
var Feedback = require('../models/feedback');
var Fbevent = require('../models/fbevent');
var Device = require('../models/device');
var Devicegroup = require('../models/devicegroup');
var Question = require('../models/question');
var UserDevices = require('../models/userdevices');
var User = require('../models/user');
var render = require('../lib/render');

const rights = require('../lib/rights')

module.exports = function (app) {

	app.get('/api/dashboard', auth.isLoggedIn(), function(req, res){
		summary.dateRange = req.query.dateRange;
		summary.toDate = req.query.to;
		summary.fromDate = req.query.from;

		summary.getUserData(req.user, req.query, function(data){
			render.api(res, null, data);
		});
	});

	app.post('/api/fbevents/count-feedbacks-over-plan',
		auth.isLoggedIn(),
		rights.getEverythingMW(),
		(req, res) => {
			const responseLimit = _.get(req, 'userRights.responseLimit');
			results.getFeedbackChainCount({
				maxFbeventCount: responseLimit,
				deviceId: req.body.devices || [],
				from: moment.utc(req.body.from, 'YYYY-MM-DD').unix(),
				to: moment.utc(req.body.to, 'YYYY-MM-DD').add(1, 'days').unix(),
				surveyId: req.body.surveys || []
			}).then(count => {
				return res.json({ count, planHasLimit: responseLimit !== undefined, planLimit: responseLimit });
			});
		});



	app.post('/api/feedbacks/:id/toggle_hidden', auth.isLoggedIn(), async function(req, res){
		var body = req.body;
		var id = req.params.id;

		if(!body || !_.isBoolean(body.hidden) || !body.question_id) {
			return res.status(400).json({ error: 'Hidden value must be a boolean' });
		}

		try{
			let feedback = await Feedback.findOne({_id: id})
			if(!feedback) {
				return res.status(404).json({ error: 'No feedback event found' });
			} else if(req.user.activeOrganizationId().toString() != feedback.organization_id.toString()) {
				return res.send(401);
			}


			for(var i=0; i<feedback.data.length; i++){
				if(feedback.data[i].question_id.toString() == body.question_id){
					feedback.data[i].hidden = body.hidden;
				}
			}

			await feedback.save()
			return res.send(200);
		} catch(e){
			console.error(e)
			res.sendStatus(500)
		}


	});

	app.get('/api/fbevents/weekly/:id', auth.isLoggedInAndAdmin(), function (req, res) {
    var query = {
			created_at: {
				$gte: new Date(req.query.from),
				$lte: new Date(req.query.to)
			},
			organization_id: req.params.id
		};

		var selectFields = {
			_id: 0,
			__v: 0,
			device_id: 0,
			question_id: 0,
			survey_id: 0,
			organization_id: 0
		};

		UserDevices.getUserDevices(req.user, function(devices){
			query.device_id = {$in: devices};
			render.dbExec(Fbevent.find(query, selectFields), res);
		});
  });
    app.get('/api/feedbacks/default', auth.isLoggedIn(), (req, res) => {
			req.user.devices()
				.then(devicesOfUser => {
					var deviceIds = _.map(devicesOfUser, device => device._id);

					return Feedback.findOne({ device_id: { $in: deviceIds } })
						.populate('survey_id')
						.sort('-created_at_adjusted_ts')
						.then(feedback => {
							if(!feedback) {
								return {
									devices: [],
									surveys: [],
									dateTo: moment.utc().format('YYYY-MM-DD'),
									dateFrom: moment.utc().subtract(6, 'days').format('YYYY-MM-DD')
								}
							} else {
								var query = {_id: { $in: deviceIds }, active_survey: feedback.survey_id._id}

								var d = _.filter(devicesOfUser, device => device._id.toString() == feedback.device_id.toString());

								return Device.find(query)
									.then(devicesOfSurvey => {
										devicesOfSurvey = [...d, ...devicesOfSurvey]
										return {
											devices: _.uniqBy(devicesOfSurvey,d => d._id.toString()),
											surveys: [feedback.survey_id],
											dateTo: moment(feedback.created_at_adjusted_ts * 1000).format('YYYY-MM-DD'),
											dateFrom: moment(feedback.created_at_adjusted_ts * 1000).subtract(6, 'days').format('YYYY-MM-DD')
										}
									});
							}
						});
				})
				.then(defaults => {
					res.json(defaults)
				})
				.catch(err => render.error(req, res, { err }));
    });

};
