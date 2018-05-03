'use strict';

var _ = require('lodash');
var jwt = require('jsonwebtoken');
var jwtSimple = require("jwt-simple");
var Promise = require('bluebird');
var moment = require('moment');
var User = require('../models/user');
var Organization = require('../models/organization');
var OrganizationRight = require('../models/organization/organization-right');
var SESSION_TTL = 3 * 60 * 60 * 1000;
var REMEMBERED_SESSION_TTL = 7 * 24 * 60 * 60 * 1000;

function onSuccess(req, res, params) {
  return new Promise((resolve, reject) => {
    params.user.rightsInOrganization(params.organization._id)
    .then(rights => {
      var maxAge = {maxAge: 24*60*60*1000} // 24 hrs
      if(req.body.rememberMe) maxAge = {maxAge: 720 * 60 * 60 * 1000} // 30 days
      const encodableObject = {id: params.user._id, oid:params.organization._id, expiration_date: Date.now() +  maxAge.maxAge}
      if(req.loginAsUser) encodableObject.method = 'admin';
      var JWTOKEN = jwtSimple.encode(encodableObject, process.env.JWT_SECRET);
      res.cookie('jwt', JWTOKEN, maxAge)
      var usr = _.assign({}, params.user.toJSON(), { 
        organization_id: params.organization._id, 
        organization_is_stripe_customer: params.organization.is_stripe_customer }, 
        { rights },
        {loggedInFromAdmin: !!req.loginAsUser},
        {jwt: JWTOKEN})
      return resolve(usr);
    })
    .catch(err => { console.log(err); reject({statusCode: 500})})

    });
}

function handleOrganization(req, res, params) {
  var targetOrganization;

  var adminOrganizations = _.map(params.user.organization_admin || [], id => id.toString());
  var organizations = _.map(params.user.organization_id || [], organization => organization._id.toString());

  if(req.query.organization && [...adminOrganizations, ...organizations].indexOf(req.query.organization) >= 0) {
    targetOrganization = req.query.organization;
  }

  return Organization.findOne({ _id: params.organizationId || targetOrganization || params.user.default_organization || params.user.organization_id[0] })
    .then(organization => {
      return onSuccess(req, res, { organization, user: params.user });
    });
}

function handleLoggedInUser(req, res, params) {
  return User.findOne({ _id: req.user._id })
    .populate('organization_id')
    .exec()
    .then(user => {
      if(user.organization_id === undefined || user.organization_id.length === 0) {
        throw ({ statusCode: 404 });
      } else {
        return handleOrganization(req, res, { user, organizationId: params.organizationId });
      }
    });
}

function handleAnonymousUser(req, res, params) {
  return User.findOne({ email: (req.body.email || '').toLowerCase()})
    .populate('organization_id')
    .exec()
    .then(user => {
      if(!user || !user.validPassword(req.body.password)) {
        console.log(`User ${req.body.email} (found: ${!!user}) tried to login with invalid credentials`)
        throw ({ statusCode: 401, message: { error: 'Invalid credentials', id: 'INVALID_CREDENTIALS' } });
      } else if(user.organization_id === undefined || user.organization_id.length === 0) {
        throw ({ statusCode: 404 });
      } else {
        return handleOrganization(req, res, { user, organizationId: params.organizationId });
      }
    });
}

function handleTokenBearer(req, res, params) {
  if(req.body.token === undefined) {
    return new Promise((resolve, reject) => reject({ statusCode: 400, error: 'No token provided' }));
  } else {
    var jwtSecret = process.env.JWT_SECRET;

    return jwt.verifyAsync(req.body.token, jwtSecret)
      .then(decoded => {
        if(decoded.tokenFor !== 'loginAsUser') {
          throw ({  statusCode: 400, error: 'Invalid token' });
        } else {
          return Promise.all([
            User.findOne({ _id: decoded.userId }),
            Organization.findOne({ _id: decoded.organizationId })
          ]).spread((user, organization) => {
            req.loginAsUser = true;
            return onSuccess(req, res, { user, organization });
          });
        }
      });
  }
}

function handle(organizationIdGetter) {
  return (req, res, next) => {
    var params = {};

    if(_.isFunction(organizationIdGetter)) {
      params.organizationId = organizationIdGetter(req);
    }

    var loginPromise;

    if(req.body.token !== undefined) {
      loginPromise = handleTokenBearer(req, res, params);
    } else if(req.user !== undefined) {
      loginPromise = handleLoggedInUser(req, res, params);
    } else {
      loginPromise = handleAnonymousUser(req, res, params);
    }

    loginPromise
      .then(user => {
        req.loggedInUser = user;
        next();
      })
      .catch(err => {
        console.log(err)
        var statusCode = _.get(err, 'statusCode') || 500;
        var message = _.get(err, 'message') || {};

        return res.status(statusCode).json(message);
      });
  }
}

module.exports = { handle }
