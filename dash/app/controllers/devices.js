'use strict';

var auth = require('../lib/auth'),
	render = require('../lib/render'),
	Devicegroup = require('../models/devicegroup'),
	Device = require('../models/device'),
        Deviceping = require('../models/deviceping'),
	UserDevice = require('../models/userdevices'),
	User = require('../models/user'),
	Organization = require('../models/organization'),
	_ = require('lodash'),
	moment = require('moment'),
	Fbevent = require('../models/fbevent');

var mongoose = require('mongoose');
var Promise = require('bluebird');
var objectId = require('bson-objectid');
var deviceConstants = require('../lib/constants/device');
var ScheduledSurvey = require('../models/scheduledsurvey');
var Survey = require('../models/survey');
var middlewares = require('../lib/middlewares');
var render = require('../lib/render');
var devicetree = require('../lib/devicetree');

const FEATURES = require('../lib/constants/features')

module.exports = function (app) {

  app.get('/api/devices',
		auth.isLoggedIn(),
		(req, res) => {
			var query = req.query.type !== undefined
				? { type: req.query.type }
				: {}
			var includeMeta = req.query.include_meta === 'true';

			req.user.devices(query)
				.then(devices => {

					if(req.query._id){ var filtered = _.filter(devices, d => { return req.query._id.indexOf(d._id.toString()) > -1 }) }
					else var filtered = devices;

					if(includeMeta) {
						return Device.findWithMeta({ _id: { $in: _.map(filtered, device => device._id) } })
							.then(devices => res.json(devices));
					} else {
						return res.json(filtered);
					}
				})
				.catch(err => render.error(req, res, { err }));
	  });

	app.post('/api/devices',
		auth.isLoggedIn(),
		auth.isOrganizationAdmin(req => req.user.activeOrganizationId()),
		async (req, res) => {
			const organization = await Organization.findOneById(req.user.activeOrganizationId());
			const canCreateChannels = await organization.hasFeature(FEATURES.CHANNEL_CREATION);
			if(!canCreateChannels) return res.status(401).json({error: "Organization has no rights to create channels"});

			var attributes = Device.populatableAttributes(req.body);

			if(attributes.type === deviceConstants.deviceTypes.DEVICE) {
				attributes.passcode = Device.generatePasscode();
			}

			attributes.organization_id = req.user.activeOrganizationId();

			var newDevice = new Device(attributes);

			Survey.findOne({ generated: true, organization: req.user.activeOrganizationId() })
				.then(survey => {
					if(survey) {
						newDevice.active_survey = survey._id;
					}

					return newDevice.save();
				})
				.then(() => Devicegroup.update({ organization_id: req.user.activeOrganizationId(), is_base_devicegroup: true }, { $addToSet: { devices: newDevice._id } }))
				.then(() => res.json(newDevice))
				.catch(err => render.error(req, res, { err }));
		})

	app.get('/api/devices/tree', auth.isLoggedIn(), (req, res) => {
		// req
		var query = req.query.type !== undefined
			? { type: req.query.type }
			: {};

		var organizationId = req.user.system_admin === true && req.query.organizationId !== undefined
			? req.query.organizationId
			: req.user.activeOrganizationId();

		req.user.rights().then(rights => {
			devicetree.getDeviceTree(query, organizationId, rights, req.user)
			.then(tree => { return res.json(tree) })
		})

	})

  app.get('/api/organization/:id/devices', auth.isLoggedInAndAdmin(), function (req, res) {
      var q = {organization_id: req.params.id};
      Device.find(q).sort({name: 1}).exec(function(err, devices){
				render.api(res, err, devices);
      });
  });

  app.get('/api/devices/:id',
		auth.isLoggedIn(),
		auth.canAccessDevices(req => [req.params.id]),
		(req, res) => {
			Promise.all([
				Device.findWithMeta({ _id: req.params.id }),
				User.findUsersWithRightToDevice(req.params.id)
			]).spread((devices, users) => {
				if(devices.length !== 0) {
					return res.json(Object.assign({}, devices[0], { usersWithRightToDevice: users }));
				} else {
					return res.sendStatus(404);
				}
			})
			.catch(err => render.error(req, res, { err }));
	  });

	app.get('/api/devices/:id/schedulations', auth.isLoggedIn(), auth.canAccessDevices(req => [req.params.id]), function(req, res) {
		ScheduledSurvey.find({ device_ids: { $in: [req.params.id] } })
			.populate('survey_id')
			.exec((err, schedulations) => {
				if(err) {
					res.sendStatus(500);
				} else {
					res.json(schedulations);
				}
			});
	});

  app.delete('/api/devices/:id',
		auth.isLoggedIn(),
		middlewares.findById('Device', req => req.params.id),
		auth.isOrganizationAdmin(req => req.targetDevice.organization_id),
		auth.canAccessDevices(req => [req.params.id]),
		(req, res) => {
			if(req.targetDevice.is_base_device === true) {
				return res.status(401).json({ error: 'Base channel can\'t be removed' });
			} else {
				req.targetDevice.remove()
					.then(() => Devicegroup.update({ devices: { $in: [req.params.id] } }, { $pull: { devices: { $in: [req.params.id] } } }, { multi: true }))
					.then(() => res.status(200).json({ok: "ok"}))
					.catch(err => render.error(req, res, { err }));
			}
		});

  app.put('/api/devices/:id', auth.isLoggedIn(), auth.canAccessDevices(req => [req.params.id]), (req, res) => {
		var attributes = Device.populatableAttributes(req.body);

    Device.findOneAndUpdate({ _id: req.params.id }, { $set: attributes }, { new: true, runValidators: true })
			.then(device => res.json(device))
			.catch(() => render.error(req, res, { err }));
  });

  app.get('/api/results/default', auth.isLoggedIn(), function(req, res) {
      UserDevice.getUserDevices(req.user, function(devices){
          Fbevent.find({device_id: {$in: devices}})
              .sort({created_at: '-1'})
              .limit(1)
              .exec(
              function(err, dbres) {
                  if (err) {
                      res.send(401);
                  } else {
                      if (dbres.length > 0) {
                          res.send(dbres[0]);
                      } else {
                          res.send(204, null);
                      }
                  }
              }
          );
      });
  });

  app.get('/api/devicepings', auth.isLoggedInAndAdmin(), function (req, res) {
      Deviceping.find({}).where('pings').slice(-1500).populate('device_id').exec(function(err, docs){
        render.api(res, err, docs);
      });

  });

  app.post('/api/devices/activate', auth.isLoggedIn(), function(req, res){
      if(req.body.survey_id && req.body.device_id){
          UserDevice.getUserDevices(req.user, function(devices) {
              if(devices.indexOf(req.body.device_id) > -1){
                  Device.findOneAndUpdate({_id: req.body.device_id}, {$set: {active_survey: req.body.survey_id, latest_activation: moment.utc().unix() }}, function(err, data){
                      render.api(res, err, data);
                  });
              } else res.send(500);
          });
      } else res.send(300);
  });

	app.get('/api/verify-udid', (req, res) => {
		if(req.query.udid){
			Device.findOne({udid: req.query.udid})
			.then(d => {
				if(d) res.json({passcode: d.passcode});
				else {
					// look from the old devices "MAP"
					res.sendStatus(404)
				}
			})
		} else res.sendStatus(400);
	})

};
