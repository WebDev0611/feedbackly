'use strict';

var objectId = require('bson-objectid');
var Promise = require('bluebird');
var auth = require('../lib/auth'),
	render = require('../lib/render'),
	Devicegroup = require('../models/devicegroup'),
	Device = require('../models/device'),
	User = require('../models/user'),
	UserDevice = require('../models/userdevices'),
	_ = require('lodash'),
	Fbevent = require('../models/fbevent'),
	deviceConstants = require('../lib/constants/device');

var OrganizationRight = require('../models/organization/organization-right');
var Survey = require('../models/survey');
var validator = require('../lib/request-validator');
var devicegroupValidator = require('../lib/devicegroup-validator');
var middlewares = require('../lib/middlewares');
var render = require('../lib/render');

module.exports = function (app) {

    app.get('/api/devicegroups',
			auth.isLoggedIn(),
			(req, res) => {
				var query = req.query.type === undefined
					? {}
					: { type: req.query.type };

				if(req.query.omit_base_devicegroup === 'true') {
					query = _.assign({}, query, { is_base_devicegroup: { $ne: true } });
				}

	      req.user.devicegroups(query)
					.then(groups => res.json(groups))
					.catch(err => render.error(req, res, { err }));
	    });

    app.get('/api/organization/:id/devicegroups', auth.isLoggedInAndAdmin(), function (req, res) {
		var q = {organization_id: req.params.id};
        Devicegroup.find(q, function(err, devicegroups){
			render.api(res, err, devicegroups);
        });
    });

    app.get('/api/devicegroups/:id',
			auth.isLoggedIn(),
			auth.canAccessDeviceGroups(req => [req.params.id]),
			middlewares.findById('Devicegroup', req => req.params.id),
			(req, res) => {
				res.json(req.targetDevicegroup);
			});

		app.put('/api/devicegroups/:id',
			auth.isLoggedIn(),
			validator.bodyRequirements(['devices']),
			auth.canAccessDeviceGroups(req => [req.params.id, ...(req.body.devicegroups || [])]),
			auth.canAccessDevices(req => req.body.devices || []),
			devicegroupValidator.noCycle(req => req.params.id, req => req.body.devicegroups || []),
			(req, res) => {
				var attributes = Devicegroup.populatableAttributes(req.body);

				attributes.devices = req.body.devices;
				attributes.devicegroups = req.body.devicegroups;

				if(req.user.system_admin === true) {
					attributes = _.assign({}, attributes, _.pick(req.body, ['type']));
				}

				Devicegroup.update({ _id: req.params.id }, { $set: attributes }, { runValidators: true })
					.then(() => res.sendStatus(200))
					.catch(err => render.error(req, res, { err }));
			});

		app.get('/api/devicegroups/:id/available_devicegroups',
			auth.isLoggedIn(),
			auth.canAccessDeviceGroups(req => [req.params.id]),
			middlewares.findById('Devicegroup', req => req.params.id),
			(req, res) => {
				var type = req.targetDevicegroup.type;

				var query = { type, devicegroups: { $nin: [req.params.id] } };

				var rightPromise = new Promise((resolve, reject) => {
					if(req.user.isOrganizationAdmin()) {
						query.organization_id = req.user.activeOrganizationId();
						query._id = { $ne: req.params.id };

						return resolve(query);
					} else {
						req.user.rights()
							.then(rights => {
								query._id = { $in: _.filter(rights.devicegroups, id => id.toString() !== req.params.id.toString()) };

								return resolve(query);
							});
					}
				});

				rightPromise
					.then(query => {
						return Devicegroup.find(_.assign({}, query, { is_base_devicegroup: { $ne: true } }))
							.then(groups => {
								res.json(groups);
							});
					})
					.catch(err => render.error(req, res, { err }));
			});

		app.get('/api/devicegroups/:id/devices',
			auth.isLoggedIn(),
			auth.deviceGroupsAreInOrganization(req => [req.params.id]),
			(req, res) => {
				Devicegroup.findOne({ _id: req.params.id })
					.then(group => {
						if(!group) {
							return res.sendStatus(404);
						} else {
							return Device.findWithMeta({ _id: { $in: group.devices } })
								.then(devices => res.json(devices));
						}
					});
			});

		app.post('/api/devicegroups/:id/devices',
			auth.isLoggedIn(),
			auth.isOrganizationAdmin(req => req.user.activeOrganizationId()),
			auth.canAccessDeviceGroups(req => [req.params.id]),
			(req, res) => {
				var attributes = Device.populatableAttributes(req.body);

				attributes.udid = objectId().toHexString();

				if(attributes.type === deviceConstants.deviceTypes.DEVICE) {
					attributes.passcode = attributes.passcode || Device.generatePasscode();
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
					.then(() => Devicegroup.update({ _id: req.params.id }, { $push: { devices: newDevice._id } }))
					.then(() => res.json(newDevice))
					.catch(err => render.error(req, res, { err }));
			});

    app.post('/api/devicegroups',
			auth.isLoggedIn(),
			auth.isOrganizationAdmin(req => req.user.activeOrganizationId()),
			(req, res) => {
				var attributes = Devicegroup.populatableAttributes(req.body);

				attributes.organization_id = req.user.activeOrganizationId();

        var newDevicegroup = new Devicegroup(attributes);

        newDevicegroup.save()
					.then(() => OrganizationRight.update({ organization_id: req.user.activeOrganizationId(), user_id: req.user._id }, { $addToSet: { 'rights.devicegroups': newDevicegroup._id } }))
					.then(() => res.json(newDevicegroup))
					.catch(err => render.error(req, res, { err }));
    });

	app.delete('/api/devicegroups/:id',
		auth.isLoggedIn(),
		auth.canAccessDeviceGroups(req => req.params.id),
		middlewares.findById('Devicegroup', req => req.params.id),
		auth.isOrganizationAdmin(req => req.targetDevicegroup.organization_id),
		(req, res) => {
			if(req.targetDevicegroup.is_base_devicegroup) {
				return res.status(400).json({ error: 'Base devicegroup can\'t be removed' });
			}

			OrganizationRight.update({ 'rights.devicegroups': { $in: [req.params.id] } }, { $pull: { 'rights.devicegroups': req.params.id } }, { multi: true })
				.then(() => req.targetDevicegroup.remove())
				.then(() => res.sendStatus(200))
				.catch(err => render.error(req, res, { err }));
		});

};
