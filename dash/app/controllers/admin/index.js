var _ = require('lodash');
var jwt = require('jsonwebtoken');
var objectId = require('bson-objectid');

var auth = require('../../lib/auth');
var middlewares = require('../../lib/middlewares');
var deviceConstants = require('../../lib/constants/device');
var render = require('../../lib/render');
var intercom = require('../../lib/intercom');

var demoDataGenerator = require('./demo-data-generator');
var Udidrequest = require('../../models/udidrequest');
var Organization = require('../../models/organization');
var User = require('../../models/user');
var Device = require('../../models/device');
var Devicegroup = require('../../models/devicegroup');

var ROOT_PATH = '/api/admin';

module.exports = app => {
  app.use(ROOT_PATH + '/*', auth.isLoggedInAndAdmin());

  app.get(`${ROOT_PATH}/organizations`, async (req, res) => {
    const organizations = await Organization.find({});
    res.send(organizations)

  })
  

  app.post(`${ROOT_PATH}/udidrequests`,
    (req, res) => {
      var newRequest = new Udidrequest(req.body);

      newRequest.save()
      .then(() => res.json(newRequest))
      .catch(err => render.error(req, res, { err }));
    });

  app.delete(`${ROOT_PATH}/udidrequests/:udid`,
    (req, res) => {
      Udidrequest.remove({ udid: req.params.udid })
        .then(() => res.sendStatus(200))
        .catch(err => render.error(req, res, { err }));
    });

  app.get(`${ROOT_PATH}/udidrequests/:udid`,
    (req, res) => {
      Udidrequest.findOne({ udid: req.params.udid })
        .then(request => res.json(request))
        .catch(err => render.error(req, res, { err }));
    });

  app.post(`${ROOT_PATH}/organizations`,
    (req, res) => {
      var newOrganization = new Organization(req.body);
      newOrganization.signupMethod = 'CREATED_BY_ADMIN';
      newOrganization.save()
      .then(() => {
        return Devicegroup.create({
          name: "All channels",
          organization_id: newOrganization._id,
          is_all_channels_group: true
        })
      })
        .then(() => res.json(newOrganization))
        .catch(err => render.error(req, res, { err }));
    });

  app.get(`${ROOT_PATH}/organizations/:id`,
    middlewares.findById('Organization', req => req.params.id, { lean: true }),
    (req, res) => {
      res.json(req.targetOrganization);
    });

  app.post(`${ROOT_PATH}/organizations/:id/devicegroups`,
    (req, res) => {
      var attributes = _.assign({}, req.body, { organization_id: req.params.id });

      var newDevicegroup = new Devicegroup(attributes);

      newDevicegroup.save()
        .then(() => res.json(newDevicegroup))
        .catch(err => render.error(req, res, { err }));
    });

  app.put(`${ROOT_PATH}/organizations/:id`,
    (req, res) => {
      Organization.findOneAndUpdate({ _id: req.body._id }, { $set: _.omit(req.body, ['_id']) }, { new: true, runValidators: true })
        .then(organization => {
          return User.updateSegmentInOrganization({ organizationId: organization._id, segment: req.body.segment })
            .then(() => organization);
        })
        .then(organization => res.json(organization))
  			.catch(err => render.error(req, res, { err }));
    });


  app.get(`${ROOT_PATH}/organizations/:id/devices`,
    (req, res) => {
      var query = { organization_id: req.params.id };

      if(req.query.type !== undefined) {
        query = _.assign({}, query, { type: req.query.type });
      }

      Device.find(query)
        .then(devices => res.json(devices))
        .catch(err => render.error(req, res, { err }));
    });

  app.get(`${ROOT_PATH}/organizations/:id/devicegroups`,
    (req, res) => {
      Devicegroup.find({ organization_id: req.params.id })
        .then(devicegroups => res.json(devicegroups))
        .catch(err => render.error(req, res, { err }));
    });

  app.post(`${ROOT_PATH}/organizations/:id/generate_demo_data`,
    (req, res) => {
      demoDataGenerator.generate(Object.assign({}, req.body, { organizationId: req.params.id }))
        .then(() => res.sendStatus(200))
        .catch(err => render.error(req, res, { err }));
    });

  app.get(`${ROOT_PATH}/organizations/:id/devicegroups/:groupId/available_devicegroups`,
      middlewares.findById('Devicegroup', req => req.params.groupId),
			(req, res) => {
				var type = req.targetDevicegroup.type;

				var query = { type, devicegroups: { $nin: [req.params.groupId] }, organization_id: req.params.id, is_base_devicegroup: { $ne: true } };

        Devicegroup.find(query)
          .then(groups => res.json(groups))
          .catch(err => render.error(req, res, { err }));
    });

  app.post(`${ROOT_PATH}/organizations/:id/devicegroups/:deviceGroupId/devices`,
    middlewares.findById('Organization', req => req.params.id),
    (req, res) => {
      var attributes = req.body;

      if(attributes.type === deviceConstants.deviceTypes.DEVICE) {
        attributes.passcode = attributes.passcode || Device.generatePasscode();
      }

      if (attributes.type === deviceConstants.deviceTypes.PLUGIN) {
        attributes.settings = {
          pluginSettings: {
            placement: "bottom-right",
            display: "popup",
            sampleRatio: 1,
            showAfterSecondsOnPage: 0,
            showAfterSecondsOnSite: 0,
            showAfterVisitedPages: 0,
            hiddenAfterClosedForHours: 24,
            hiddenAfterFeedbackForHours: 24,
            afterPercentage: 0,
            exitTrigger: false,
            urlPatterns: { mode: "single", rules: [] },
            excludeUrls: []
          },
          ...attributes.settings
        };
      }

      attributes.organization_id = req.params.id;

      var newDevice = new Device(attributes);

      newDevice.save()
        .then(() => Devicegroup.update({ organization_id: req.params.id, is_all_channels_group: true }, { $push: { devices: newDevice._id } }))
        .then(() => Devicegroup.update({ _id: req.params.deviceGroupId, $or: [{is_all_channels_group: false}, {is_all_channels_group: {$exists: false}}] }, { $push: { devices: newDevice._id } }))
        .then(() => res.json(newDevice))
        .catch(err => render.error(req, res, { err }));
    });

  app.post(`${ROOT_PATH}/login_token`,
    async (req, res) => {
      var jwtSecret = process.env.JWT_SECRET;

      var payload = {
  			tokenFor: 'loginAsUser'
  		};

  		var tokenOptions = {
  			expiresIn: 60 * 3
      };
      const loginUser = await User.findById(req.body.userId);
      const loginOrganization = await Organization.findById(req.body.organizationId);

      console.log(`User ${req.user.email} logged in as ${loginUser.displayname} (${req.body.userId}) from ${loginOrganization.name}`)

  		jwt.sign(_.assign({}, payload, { userId: req.body.userId, organizationId: req.body.organizationId }), jwtSecret, tokenOptions, (token) => {
        return res.json({ token });
      });
    });
}
