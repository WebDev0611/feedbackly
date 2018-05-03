// app/models/device.js
'use strict';

var _ = require('lodash');
var Promise = require('bluebird');
var mongoose = require('mongoose');
var deviceConstants = require('../../lib/constants/device');
var Mailinglistaddress = require('./mailinglistaddress');
var SmsContact = require('./smscontact');
var Devicefeedback = require('./devicefeedback');
var TinyLink = require('../tinylink');
var ScheduledSurvey = require('../scheduledsurvey');
var shortid = require('shortid');

shortid.characters("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$")

var clientLink = require('../../lib/client-link');

var deviceSchema = mongoose.Schema({
  name: { type: String, required: true, minlength: 1 },
	type: { type: String, enum: _.values(deviceConstants.deviceTypes), required: true },
	description: String,
  organization_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Organization' },
  udid: {type: String, default: shortid.generate, unique: true},
  active_survey: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey' },
	logo: String,
	passcode: String,
  last_seen: Date,
  latest_activation: Number,
  setupDone: Boolean,
  settings: Object,
  v4: {type: Boolean, default: true},
  upsells: {
    neutral: mongoose.Schema.Types.ObjectId,
    positive: mongoose.Schema.Types.ObjectId,
    negative: mongoose.Schema.Types.ObjectId
  },
  hashids_seed_number: Number,
  force_default_language: String,
  ipad_setup_device: {type: Boolean, required: false },
  contact_id_seed: Number,
  profanityFilter: Boolean,
  mdm_link: String,
  ip_assignment: {type: String, unique: true, sparse: true}
});

function feedbackCountMap(devices) {
  var map = {};

  var stream = Devicefeedback.find({ device_id: { $in: _.map(devices, device => device._id) } }).stream();

  return new Promise((resolve, reject) => {
    stream.on('data', counter => {
      map[(counter.device_id || '').toString()] = counter.feedback_count;
    });

    stream.on('end', () => resolve(map));
    stream.on('error', () => reject());
  });
}

function scheduledSurveysMap(devices) {
  var map = {};

  var stream = ScheduledSurvey
    .find({ device_ids: { $in: _.map(devices, device => device._id) } })
    .populate('survey_id')
    .stream();

  return new Promise((resolve, reject) => {
    stream.on('data', schedulation => {
      (schedulation.device_ids || []).forEach(deviceId => {
        map[deviceId.toString()] = map[deviceId.toString()] || [];
        map[deviceId.toString()].push(schedulation);
      });
    });

    stream.on('end', () => resolve(map));
    stream.on('error', () => reject());
  });
}

function contactCount(devices){
  var promises = _.map(devices, device => {
    if(device.type === 'EMAIL'){
      return Mailinglistaddress.count({mailinglist_id: device._id, unsubscribed: false})
      .then(count => { return {_id: device._id, contactCount: count}})
    } else if(device.type === 'SMS'){
      return SmsContact.count({device_id: device._id})
      .then(count => { return {_id: device._id, contactCount: count}})
    } else {
      return new Promise((resolve, reject) => resolve({ _id: device._id, contactCount: undefined }));
    }
  })

  return Promise.all(promises)
    .then(devices => {
      return _.reduce(devices, (mapped, device) => {
        mapped[device._id.toString()] = device.contactCount;
        return mapped;
      }, {});
    })
}

function linkMap(devices) {
  var typesWithLink = [deviceConstants.deviceTypes.QR, deviceConstants.deviceTypes.LINK, deviceConstants.deviceTypes.SMS];

  var promises = _.map(devices, device => {
    if(typesWithLink.indexOf(device.type) >= 0) {
      return TinyLink.getLink(clientLink.createLink({ udid: device.udid }))
        .then(link => {
          return { _id: device._id, link };
        });
    } else {
      return new Promise((resolve, reject) => resolve({ _id: device._id, link: undefined }));
    }
  });

  return Promise.all(promises)
    .then(devices => {
      return _.reduce(devices, (mapped, device) => {
        mapped[device._id.toString()] = device.link;

        return mapped;
      }, {});
    });
}

deviceSchema.statics.populatableAttributes = function(object) {
  return _.pick(object, ['name', 'type', 'description', 'logo', 'bgcolor', 'use_default_settings', 'passcode', 'settings', 'upsells', 'udid', 'force_default_language', 'profanityFilter', 'mdm_link', 'ip_assignment'])
}

deviceSchema.statics.generatePasscode = function() {
  return _.map(new Array(4), item => Math.floor(Math.random() * 9.99)).join('');
}

deviceSchema.statics.findWithMeta = function(query, populate) {
  var deviceList = [];
  var populateString = 'active_survey';
  if(populate) populateString = '';

  return this.find(query)
    .populate(populateString)
    .exec()
    .then(devices => {
      deviceList = devices;

      return Promise.all([
        feedbackCountMap(devices),
        linkMap(devices),
        contactCount(devices),
        scheduledSurveysMap(devices)
      ]).spread((deviceIdToFeedbackCount, deviceIdToLink, contactCount, deviceIdToSchedulations) => {
        return _.map(deviceList, device => {
          return _.assign({}, device.toJSON(), {
            contactCount: contactCount[device._id.toString()],
            link: deviceIdToLink[device._id.toString()],
            feedback_count: deviceIdToFeedbackCount[device._id.toString()] || 0,
            schedulations: deviceIdToSchedulations[device._id.toString()] || []
          });
        });
      });
    });
}


deviceSchema.statics.findOneWith = function(query, withValues) {
  withValues = withValues || {};
  var clientUrl = process.env.CLIENT_URL;

  var promises = [
    this.findOne(query).populate('active_survey').exec(),
    withValues.feedbackCount === true
      ? Devicefeedback.findOne({ device_id: query._id })
      : undefined
  ];

  return Promise.all(promises)
    .spread((device, count) => {
      var countObject = count === undefined
        ? {}
        : { feedback_count: (count || {}).feedback_count || 0 };

      var deviceObject = device === null
        ? {}
        : device.toJSON();

      if(withValues.link === true && device) {
        return TinyLink.getLink(clientLink.createLink({ udid: device.udid }))
          .then(link => {
            return _.assign(deviceObject, countObject, { link });
          });
      } else {
        return _.assign(deviceObject, countObject);
      }
    })
    .then(device => {
      return device;
    });
}

deviceSchema.pre('remove', function(next) {
  if(this.type === undefined) {
    next();
  }

  if(this.type === deviceConstants.deviceTypes.EMAIL) {
    Mailinglistaddress.remove({ mailinglist_id: this._id })
      .then(next);
  } else if(this.type === deviceConstants.deviceTypes.SMS) {
    SmsContact.remove({ device_id: this._id })
      .then(next);
  } else {
    next();
  }
});

module.exports = mongoose.model('Device', deviceSchema);












