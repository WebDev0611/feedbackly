'use strict';

var FBAmount = require('./summary/feedbackamount');
var FBAverage = require('./summary/feedbackaverage');
var UserDevices = require('../models/userdevices');
var User = require('../models/user');

var cache = require('../lib/cache');

var Promise = require('bluebird');
var moment = require('moment');
var range = require('moment-range');
var auth = require('../lib/auth');
var q = require('q');
var _ = require('lodash');

function feedbackAmount(options){
  return new Promise((resolve, reject) => {
    options.user.devices()
      .then(devices => {
        options.query.device_id = { $in: _.map(devices, device => device._id) }

        FBAmount.getFeedbackAmount(options.query, function(amountObject){
            amountObject.busiestDay = FBAverage.getBest(amountObject.graph);
            amountObject.quietestDay = FBAverage.getWorst(amountObject.graph);

            resolve(amountObject);
        })
    });
  });
}

function organizationAverage(options) {
  return FBAverage.getOrganizationAverage(options);
}

function fbeventAmount(options) {
  return new Promise((resolve, reject) => {
    options.user.devices()
      .then(devices => {
        options.query.device_id = { $in: _.map(devices, device => device._id) }

        FBAmount.getFbeventAmount(options.query, function(amount){
          resolve({count: amount});
        });
    });
  });
}

function allFbeventAmount(options) {
  return new Promise((resolve, reject) => {
    options.user.devices()
      .then(devices => {
        FBAmount.getAllFeedbackAmount({ device_id: { $in: _.map(devices, device => device._id) } }, function(count){
          resolve({count: count})
        });
      });
  });
}

function averageDay(options) {
  return options.user.devices()
    .then(devices => {
      options.query.device_id = { $in: _.map(devices, device => device._id) };

      return FBAverage.getFeedbackAverageByDay(options.query);
    });
}

function bestDevicesByAverage(options) {
  return FBAverage.getBestDevicesByAverage(options);
}

function averageHour(options) {
  return options.user.devices()
    .then(devices => {
      options.query.device_id = { $in: _.map(devices, device => device._id) };

      return FBAverage.getFeedbackAverageByHour(options.query);
    });
}

function summaryDigest(options) {
  var fbeventQuery = {
      created_at_adjusted_ts: {
        $gte: moment.utc(options.from).unix(),
        $lte: moment.utc(options.to).unix()
      }
  }

  var feedbackQuery = {
    created_at: {
      $gte: moment.utc(options.from).toDate(),
      $lte: moment.utc(options.to).toDate()
    }
  }

  return q.all([
    fbeventAmount({ query: fbeventQuery, user: options.user }),
    allFbeventAmount({ user: options.user }),
    feedbackAmount({ query: feedbackQuery, user: options.user }),
    averageDay({ user: options.user, query: feedbackQuery }),
    averageHour({ user: options.user, query: fbeventQuery })
  ]);
}

module.exports = function (app) {
    app.get('/api/summary/digest',
    auth.hasValidApiKey(req => req.query.api_key),
    (req, res) => {
      User.findOne({ _id: req.query.user }, function(err, targetUser) {
        if(err) return res.sendStatus(500);
        if(!targetUser) return res.sendStatus(404);

        var from = req.query.from;
        var to = req.query.to;
        var user = targetUser;

        user._activeOrganizationId = req.query.organization;

        summaryDigest({ from, to, user })
          .then(function(summary) {
            var formatted = {
              individualEvents: summary[0].count,
              allFeedbacks: summary[1].count,
              periodFeedbacks: summary[2].totalFeedbacks,
              busiestDay: _.get(summary[2], 'busiestDay[0]'),
              quietestDay: _.get(summary[2], 'quietestDay[0]'),
              average: summary[3].average,
              bestDay: _.get(summary[3], 'bestDay[0]'),
              worstDay: _.get(summary[3], 'worstDay[0]'),
              bestHour: _.get(summary[4], 'bestHour[0]'),
              worstHour: _.get(summary[4], 'worstHour[0]')
            };

            return res.json(formatted);
          });
      });
    });

    app.get('/api/summary/digest/charts',
      auth.hasValidApiKey(req => req.query.api_key),
      (req, res) => {
        User.findOne({ _id: req.query.user }, function(err, targetUser) {
          if(err) return res.sendStatus(200);
          if(!targetUser) return res.sendStatus(200);

          var from = req.query.from;
          var to = req.query.to;
          var user = targetUser;

          user._activeOrganizationId = req.query.organization;

          var feedbackQuery = {
            created_at: {
              $gte: moment.utc(from).toDate(),
              $lte: moment.utc(to).toDate()
            }
          }

          var promise = q.all([
            feedbackAmount({ query: feedbackQuery, user: user }),
            averageDay({ query: feedbackQuery, user: user })
          ]);

          promise
            .then(data => res.render('summary-digest/charts.ejs', { from: moment.utc(from).unix(), to: moment.utc(to).unix(), amount: JSON.stringify(data[0].graph), average: JSON.stringify(data[1].graph) }));
        });
      });

    app.get('/api/summary/best_devices', auth.isLoggedIn(), cache.middleware(req => `summary_best_devices_${req.user.activeOrganizationId()}_${req.query.from}_${req.query.to}`), function(req, res) {
      bestDevicesByAverage({ organizationId: req.user.activeOrganizationId(), dateFrom: moment.utc(req.query.from).unix(), dateTo: moment.utc(req.query.to).unix() })
        .then(best => {
          cache.set(`summary_best_devices_${req.user.activeOrganizationId()}_${req.query.from}_${req.query.to}`, JSON.stringify(best), { ttl: 60 * 60 * 24 });
          res.json(best)
        })
        .catch(err => res.send(500));
    });

    app.get('/api/summary/average/organization', auth.isLoggedIn(), cache.middleware(req => `summary_organization_average_${req.user.activeOrganizationId()}_${req.query.from}_${req.query.to}`), function(req, res) {
      organizationAverage({ organizationId: req.user.activeOrganizationId(), dateFrom: moment.utc(req.query.from).unix(), dateTo: moment.utc(req.query.to).unix() })
        .then(average => {
          cache.set(`summary_organization_average_${req.user.activeOrganizationId()}_${req.query.from}_${req.query.to}`, JSON.stringify(average), { ttl: 60 * 60 * 24 });
          res.json(average)
        })
        .catch(err => res.send(500));
    });

    app.get('/api/summary/amount/fb', auth.isLoggedIn(), cache.middleware(req => `${req.user._id}_summary_amount_fb_${req.query.from}_${req.query.to}`), function(req, res){
        var query = {
          created_at: {
            $gte: moment.utc(req.query.from).toDate(),
            $lte: moment.utc(req.query.to).toDate()
          }
        }

        feedbackAmount({ query: query, user: req.user })
          .then(amount => {
            cache.set(`${req.user._id}_summary_amount_fb_${req.query.from}_${req.query.to}`, JSON.stringify(amount), { ttl: 60 * 60 });
            res.send(amount)
          });
    })

    app.get('/api/summary/amount/fbe', auth.isLoggedIn(), cache.middleware(req => `${req.user._id}_summary_amount_fbe_${req.query.from}_${req.query.to}`), function(req, res){
        var query = {
            created_at_adjusted_ts: {
                    $gte: moment.utc(req.query.from).unix(),
                    $lte: moment.utc(req.query.to).unix()
                }

        }

        fbeventAmount({ query: query, user: req.user })
          .then(amount => {
            cache.set(`${req.user._id}_summary_amount_fbe_${req.query.from}_${req.query.to}`, JSON.stringify(amount), { ttl: 60 * 60 });
            res.send(amount)
          });
    });

    app.get('/api/summary/amount/allfb', auth.isLoggedIn(), cache.middleware(req => `${req.user._id}_summary_amount_allfb_${req.query.from}_${req.query.to}`), function(req, res){
        allFbeventAmount({ user: req.user })
          .then(amount => {
            cache.set(`${req.user._id}_summary_amount_allfb_${req.query.from}_${req.query.to}`, JSON.stringify(amount), { ttl: 60 * 60 });
            res.send(amount)
          });
    })

    app.get('/api/summary/average/day', auth.isLoggedIn(), cache.middleware(req => `${req.user._id}_summary_average_day_${req.query.from}_${req.query.to}`), function(req, res){
        var query = {
            created_at: {
                    $gte: moment.utc(req.query.from).toDate(),
                    $lte: moment.utc(req.query.to).toDate() }

        }

        averageDay({ user: req.user, query: query })
          .then(average => {
            cache.set(`${req.user._id}_summary_average_day_${req.query.from}_${req.query.to}`, JSON.stringify(average), { ttl: 60 * 60 });
            res.send(average)
          });
    })

    app.get('/api/summary/average/hour', auth.isLoggedIn(), cache.middleware(req => `${req.user._id}_summary_average_hour_${req.query.from}_${req.query.to}`), function(req, res){
        var query = {
            created_at_adjusted_ts: {
              $gte: moment.utc(req.query.from).unix(),
              $lte: moment.utc(req.query.to).unix()
            }
        }

        averageHour({ user: req.user, query: query })
          .then(average => {
            cache.set(`${req.user._id}_summary_average_hour_${req.query.from}_${req.query.to}`, JSON.stringify(average), { ttl: 60 * 60 });
            res.send(average);
          });
    })

    app.get('/api/summary/nps', auth.isLoggedIn(), cache.middleware(req => `${req.user._id}_summary_nps_${req.query.from}_${req.query.to}`), function(req, res){
        req.user.devices()
          .then(devices => {
            var query = {
              dateFrom: moment.utc(req.query.from).unix(),
              dateTo: moment.utc(req.query.to).unix(),
              devices
            }

            FBAverage.getOverallNPS(query, npsObject => {
              cache.set(`${req.user._id}_summary_nps_${req.query.from}_${req.query.to}`, JSON.stringify(npsObject), { ttl: 60 * 60 });
              res.send(npsObject)
            });
          });
    });

}
