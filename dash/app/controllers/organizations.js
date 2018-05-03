'use strict';
var _ = require('lodash');
var moment = require('moment');

var auth = require('../lib/auth');
var render = require('../lib/render');
var Organization = require('../models/organization');
var Devicegroup = require('../models/devicegroup');
var User = require('../models/user');
var validator = require('../lib/request-validator');
var middlewares = require('../lib/middlewares');
var render = require('../lib/render');


module.exports = function (app) {

	app.get('/api/organizations', auth.isLoggedInAndAdmin(), function (req, res) {
		render.dbExec(Organization.find({}), res);
	});

	app.get('/api/organization', auth.isLoggedIn(), function (req, res) {
		Organization.findOne({ _id: req.user.activeOrganizationId() })
			.then(organization => {
				if (!organization) {
					return res.sendStatus(404);
				} else {
					return res.json(organization);
				}
			})
			.catch(err => render.error(req, res, { err }));
	});

	app.get('/api/organizations/:id',
		auth.isLoggedIn(),
		auth.isInOrganization(req => req.params.id),
		(req, res) => {
			return Organization.findOne({ _id: req.params.id })
				.then(organization => organization ? res.json(organization.toJSON()) : res.sendStatus(404))
				.catch(err => render.error(req, res, { err }));
		});

	app.get('/api/organizations/:id/users',
		auth.isLoggedIn(),
		auth.isOrganizationAdmin(req => req.params.id),
		(req, res) => {
			User.find({ organization_id: req.params.id })
				.then(users => {
					if (!users) {
						return res.sendStatus(404);
					} else {
						return res.json(users);
					}
				})
				.catch(err => render.error(req, res, { err }));
		});


	app.post('/api/organizations', auth.isLoggedInAndAdmin(), function (req, res) {
		var org = new Organization(req.body);

		org.save()
			.then(() => res.json(org))
			.catch(err => render.error(req, res, { err }));
	});

	app.get('/api/organizations/:id/devicegroups',
		auth.isLoggedIn(),
		auth.isOrganizationAdmin(req => req.params.id),
		(req, res) => {
			Devicegroup.find({ organization_id: req.params.id })
				.then(devicegroups => res.json(devicegroups))
				.catch(err => render.error(req, res, { err }));
		});

	app.put('/api/organizations/:id', auth.isLoggedIn(), auth.isOrganizationAdmin(req => req.params.id), function (req, res) {
		var attributes = Organization.populatableAttributes(req.body);

		Organization.update({ _id: req.params.id }, { $set: attributes })
			.then(() => res.sendStatus(200))
			.catch(err => render.error(req, res, { err }));
	});

};
