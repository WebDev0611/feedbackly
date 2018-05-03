'use strict';

var passport = require('passport');
var Promise = require('bluebird');
var _ = require('lodash');
var clientTranslations = require('../../config/translations');

var auth = require('../lib/auth');
var jwtAuth = require('../../config/auth')()
var deviceTypes = require('../lib/constants/device').deviceTypes;
var paymentConstants = require('../lib/constants/payment-plan');
var CompletedHint = require('../models/completedhint');
var Organization = require('../models/organization');
var cache = require('../lib/cache');

var mongoose = require('mongoose');

var intercom = require('../lib/intercom');

const fs = require('fs');
const path = require('path')
function redirectToLogin() {
	return (req, res, next) => res.redirect('/');
}

module.exports = function (app) {

	app.get('/health', (req, res) => {
		var mongoConnected = mongoose.connection.readyState === 1;
		var client = cache.getClient()
		client.set('abc', function(err,result) {
		  var redisConnected = err ? true : false;
			if(mongoConnected && redisConnected) {
				var status = {status: 'ok'};
				console.log(status)
				res.status(200).send(status)
			} else {
				var status = {status:'no connection', redis: redisConnected, mongo: mongoConnected}
				console.log(status)
				res.status(500).send(status)
				process.exit(1)
			}
		});
	})

	app.get('/kirjaudu', redirectToLogin());

	app.get('/login', redirectToLogin());

	app.get('/', function(req, res) {
    if(req.user !== undefined) {
      res.redirect('/app');
    } else {
			res.redirect('/v-app/#/login');			
    }
	});

	app.get('/terms', (req, res) => {
		res.render('terms');
	});

	app.get('/app',
		jwtAuth.authenticate(),
		intercom.dataMiddleware(),
		(req, res) => {
			if (req.user){
				Promise.all([
					CompletedHint.getCompleted(req.user._id),
					Organization.hasFeedback(req.user.activeOrganizationId()),
					Organization.findOne({ _id: req.user.activeOrganizationId() })
				]).spread((completedHints, hasFeedback, hasSource, organization) => {
					res.render('index.ejs', {
						clientUrl: process.env.CLIENT_URL,
						dashUrl: process.env.DASH_URL,
						previewUrl: process.env.PREVIEW_URL,
						env: process.env.NODE_ENV,
						stripePublicKey: process.env.STRIPE_PUBLIC_KEY,
						euCountyCodes: paymentConstants.euCountyCodes,
						pluginJsUrl: process.env.PLUGIN_JS_URL,
						pluginCssUrl: process.env.PLUGIN_CSS_URL,
						smsTinyLinkHost: process.env.SMS_TINY_LINK_HOST,
						completedHints,
						hasFeedback,
						userDisplayname: req.user.displayname,
						clientTranslations,
						userTutorialsFinished: req.user.tutorials_finished === undefined ? [] : req.user.tutorials_finished,
						constants: { deviceTypes },
						intercomAppId: process.env.INTERCOM_APP_ID,
						intercomData: req.intercom,
						hideIntercom: !!req.user.loggedInFromAdmin,
						FEATURECONSTANTS: require('../lib/constants/features')
					});
				});

			} else {
				res.redirect('/');
			}
	  });
};
