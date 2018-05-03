var mongoose = require('mongoose');
var Promise = require('bluebird');
var _ = require('lodash');
var bcrypt   = require('bcrypt-nodejs');
var objectId = require('bson-objectid');

var emailConfirmation = require('./email-confirmation');
var passwordReset = require('./password-reset');
var paymentReceipt = require('./payment-receipt');
var deviceConstants = require('../../lib/constants/device');
var billingConstants = require('../../lib/constants/organization').billing;
var segmentConstants = require('../../lib/constants/organization').segment;
var planSettings = require("../../lib/billing/plan-settings")
var paymentConstants = require('../../lib/constants/payment-plan');
var intercom = require('../../lib/intercom');

var auth = require('../../lib/auth');

var Device = require('../device');
var Devicegroup = require('../devicegroup');
var Organization = require('../organization');
var Survey = require('../survey');
var OrganizationRight = require('../organization/organization-right');

function userMethods(userSchema) {

  userSchema.pre('save', function(next) {
    if(_.isString(this.email)) {
      this.email = this.email.toLowerCase();
    }

    next();
  });

  userSchema.statics.populatableAttributes = function(object) {
    return _.pick(object, ['email', 'displayname', 'password', 'phone_number']);
  }

  userSchema.statics.updateSegmentInOrganization = function(options) {
    return Promise.all([
      this.update({ organization_id: { $in: [options.organizationId] } }, { $set: { segment: options.segment } }, { multi: true }),
      this.find({ organization_id: { $in: [options.organizationId] } })
    ])
    /*.spread((update, users) => {
      return Promise.all(users.map(user => intercom.createUser(user, { segment: options.segment })));
    }); */
  }

  userSchema.statics.findUsersWithRightToDevice = function(deviceId) {
    return Devicegroup.find({ devices: { $in: [deviceId] } })
      .then(groups => {
        return OrganizationRight.find({ 'rights.devicegroups': { $in: groups.map(group => group._id) } })
      })
      .then(rights => {
        return this.find({ _id: { $in: rights.map(right => right.user_id) } });
      });
  }

  userSchema.statics.generateHash = function(password) {
      return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
  };

  userSchema.methods.generateHash = function(password) {
      return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
  };

  userSchema.methods.validPassword = function(password) {
      return bcrypt.compareSync(password, this.password);
  };

  userSchema.methods.sendEmailConfirmation = function() {
    return emailConfirmation.send({
      receiver: this.email,
      userId: this._id
    });
  }

  userSchema.methods.sendPaymentReceipt = function(options) {
    return paymentReceipt.send(Object.assign({}, options, { user: this }));
  }

  userSchema.methods.rightsInOrganization = async function(organizationId) {
    const rights = await OrganizationRight.findOne({ user_id: this._id, organization_id: organizationId })
    const actualRights = _.get(rights, 'rights') || { survey_create: false, devicegroups: [] };
    return actualRights
  }

  userSchema.methods.activeOrganizationId = function() {
    return this._activeOrganizationId ? this._activeOrganizationId.toString() : undefined;
  }

  userSchema.methods.rights = function() {
    if(this._activeOrganizationId === undefined) return {};

    return this.rightsInOrganization(this._activeOrganizationId);
  }

  userSchema.methods.isOrganizationAdmin = function() {
    if(this._activeOrganizationId === undefined) return false;

    return this.isOrganizationAdminOf(this._activeOrganizationId);
  }

  userSchema.methods.devices = function(query) {
    var promises = [];

    var organizationsToQuery = this._activeOrganizationId !== undefined ? [this._activeOrganizationId]
    : this.organization_id;

    _.forEach(organizationsToQuery, orgid => {
      var p = this.rightsInOrganization(orgid)
        .then(rights => {
          return Devicegroup.find({ _id: { $in: _.get(rights, 'devicegroups') || [] } })
            .select({ _id: 0, devices: 1 })
            .exec()
            .then(groups => {
              var deviceIds = _.chain(groups).reduce((ids, group) => ids = [...ids, ...(group.devices || [])], []).uniq().value();

              return Device.find(_.assign({ _id: { $in: deviceIds } }, query || {}))
            });
        })
      promises.push(p);
    })

    if(this.isOrganizationAdminOf(this.organization_id)) {
      promises.push(Device.find(_.assign({ organization_id: this.organization_id }, query || {})));
    }

    return Promise.all(promises)
      .then(data => {
        return _.uniqBy([...data[0], ...(data[1] || [])], device => device._id.toString());
      });
  }

  userSchema.methods.devicegroups = function(query) {
    if(this._activeOrganizationId === undefined) return [];

    return this.rightsInOrganization(this._activeOrganizationId)
      .then(rights => {
        var usersDevicegroups = _.get(rights, 'devicegroups') || [];

        var groupQuery = this.isOrganizationAdminOf(this.organization_id)
          ? { organization_id: this._activeOrganizationId }
          : { _id: { $in: usersDevicegroups } };

        return Devicegroup.find(_.assign(groupQuery, query || {}));
      });
  }

  userSchema.methods.sendPasswordReset = function() {
    return passwordReset.send({
      receiver: this.email,
      userId: this._id
    });
  }

  userSchema.methods.isOrganizationAdminOf = function(organizationId) {
    if(organizationId === undefined || this.organization_admin === undefined || this.organization_admin.length === 0) return false;

    return _.find(this.organization_admin, organization => organization.toString() === organizationId.toString()) !== undefined;
  }

  userSchema.methods.isInOrganization = function(organizationId) {
    if(organizationId === undefined) return false;

    var usersOrganizations = [...(this.organization_admin || []), ...(this.organization_id || []), ...(this.organization_ids || [])];

    return _.find(usersOrganizations, organization => organization.toString() === organizationId.toString()) !== undefined;
  }

  userSchema.methods.toJSON = function() {
    var userObject = this.toObject();

    if(this._activeOrganizationId !== undefined) {
      userObject.organization_id = this._activeOrganizationId;
    }

    var userObject = _.omitBy(userObject, (value, key) => _.startsWith(key, '_') && key !== '_id');

    return _.omit(userObject, ['password', 'email_confirmed']);
  }

  userSchema.methods.bootstrap = function(options) {

    var deviceTypes = _.values(deviceConstants.deviceTypes);

    var newOrganization = new Organization({
      name: options.organizationName,
      created_at: new Date,
      plan: planSettings.constants.FREE_PLAN,
      segment: segmentConstants.SELF_SIGNUP,
      signupMethod: 'WEB'
    });

    if(options.isIpadClient) {
      newOrganization.pending_ipad_signup=true;
      newOrganization.signupMethod='IPAD';
    }

    var insertDevices = activeSurvey => {

      if(options.isIpadClient){
        var newDevice = {
          type: deviceConstants.deviceTypes.DEVICE,
          name: 'Your iPad',
          organization_id: newOrganization._id,
          udid: options.udid,
          active_survey: activeSurvey._id,
          passcode: options.passcode,
          ipad_setup_device: true
        }

        return Device.create(newDevice);
      } else return new Promise((resolve,reject) =>{resolve(false)});
    }

    var insertDevicegroups = (device) => {

      var devices = device._id ? [device._id] : [];

      var deviceGroup ={
        name: 'All channels',
        devices: devices,
        organization_id: newOrganization._id,
        is_all_channels_group: true
      };

      return Devicegroup.create(deviceGroup)
    }

    var insertRights = (groupId) => {

      return OrganizationRight.updateUsersRights(this._id, newOrganization._id, {
        devicegroups: [groupId],
        survey_create: true
      });
    }

    var updateOrganizationId = () => {
      this.organization_id = [newOrganization._id];
      this.organization_admin = [newOrganization._id];
      this.default_organization = newOrganization._id;
    }
    return this.validate()
      .then(() => newOrganization.validate())
      .then(newOrganization.save)
      .then(updateOrganizationId)
      .then(() => this.save())
      .then(() => Survey.generateTutorialSurvey({ createdBy: this._id, organizationId: newOrganization._id, isIpadClient: options.isIpadClient }))
      .then(insertDevices)
      .then(insertDevicegroups)
      .then(insertRights);
  }
}

module.exports = userMethods;
