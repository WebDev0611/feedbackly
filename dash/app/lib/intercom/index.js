var _ = require('lodash');
var Intercom = require('intercom-client');

var client = new Intercom.Client(process.env.INTERCOM_APP_ID, process.env.INTERCOM_API_KEY).usePromises();

var Organization = require('../../models/organization');

function createUser(user, params) {
  var customAttributes = Object.assign({}, params || {});
  var userData = { id: user._id.toString(), email: user.email };

  return Organization.findOne({ _id: (user.organization_id || [])[0] })
    .then(organization => {
      if(organization) {
        customAttributes = Object.assign({},
          customAttributes,
          organization.segment !== undefined ? { segment: organization.segment } : {},
          typeof organization.meta === 'object' ? organization.meta : {}
        );
      }
    })
    .then(() => {
      console.log('Creating Intercom User', Object.assign({}, userData, { custom_attributes: customAttributes }));
      return client.users.create(Object.assign({}, userData, { custom_attributes: customAttributes }));
    });
}

function deleteUser(id){
  return client.users.delete({id})
}

function pathEventMiddleware() {
  return (req, res, next) => {
    next();
  }
}

function eventMiddleware(options) {
  options = options || {};

  return (req, res, next) => {
    var eventName = options.eventName;
    var meta = options.meta;
    var userId = _.get(req, 'user._id') || options.userId;

    if(_.isFunction(options.meta)) {
      meta = options.meta(req);
    }

    if(_.isFunction(options.userId)) {
      userId = options.userId(req);
    }

    if(_.isFunction(options.eventName)) {
      eventName = options.eventName(req);
    }

    if(userId !== undefined && eventName !== undefined) {
      client.events.create({
        event_name: eventName,
        created_at: Math.floor(new Date().getTime() / 1000),
        user_id: userId.toString(),
        metadata: meta || {}
      });
    }

    next();
  }
}
function createEvent(userId, eventName) {
  client.events.create({
    event_name: eventName,
    created_at: Math.floor(new Date().getTime() / 1000),
    user_id: userId
  });
}

function dataMiddleware() {
  return async (req, res, next) => {
    if(req.user === undefined) {
      req.intercom = {};
    } else {

      var org = await Organization.findOne({_id: req.user.activeOrganizationId()})

      req.intercom = {
        app_id: process.env.INTERCOM_APP_ID,
        user_id: req.user._id.toString(),
        email: (req.user.email || '').toString(),
        name: req.user.displayname,

          organization: org.name,
          segment: org.segment

      };
    }

    next();
  }
}

module.exports = { createUser, eventMiddleware, dataMiddleware, pathEventMiddleware, deleteUser, createEvent };
