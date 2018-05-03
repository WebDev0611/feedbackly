/* eslint-disable */

var _ = require('lodash');
var Promise = require('bluebird');
var request = require('request-promise');

var activeSurvey = require('./utils/active_survey');

var Device = require('app-modules/models/device');
var Screenshot = require('app-modules/models/screenshot');
var errors = require('app-modules/errors');

var clientRenderer = require('app-modules/middlewares/client-renderer');
var clientState = require('app-modules/middlewares/client-state');
var surveys = require('app-modules/middlewares/surveys');
var general = require('app-modules/middlewares/general');
var validators = require('app-modules/middlewares/validators');
var errorHandlers = require('app-modules/middlewares/errors');
var oldRedirect = require('app-modules/middlewares/old-redirect');


module.exports = app => {

  app.get('/', oldRedirect.findOldRedirect);
  app.get('/mobile', oldRedirect.findOldRedirect);
  app.get('/mobile-new/:udid', oldRedirect.findOldRedirect);
  app.get('/ipad-new/:udid', oldRedirect.findOldRedirect);

  app.get('/ipad/:build/',
    oldRedirect.findOldRedirect,
    async (req, res, next) => {

      let device;
      const ip = req.query.ip;
      if(ip !== undefined){
        device = await Device.findOne({ip_assignment: ip})
      }

      res.render('../client/registration/register.ejs', { channel: device || {} });

    });

  app.get('/ipad/:build/:udid',
    oldRedirect.findOldRedirect,
    clientRenderer.renderClientWithMiddlewares([
      surveys.getSurveyByUdid(req => req.params.udid),
      clientState.setClientBuild(req => req.params.build),
      clientState.addClientDecorator(req => 'ipad')
    ]));

  app.get('/ipad-setup/:ip',
    async (req, res, next) => {
      const device = Device.findOne({ip_assignment: req.params.ip})
      if(device && device.udid) return res.send(device.udid);
      return next(new errors.NotFoundError())
    },
    errorHandlers.apiErrorHandler({ sendMessage: false }
  ));

  app.post('/ipad/verify-udid',
    validators.validateBody({ udid: { presence: true } }),
    (req, res, next) => {
      Device.findOne({ udid: req.body.udid })
        .then(channel => {
          if(channel) {
            return res.json({ udid: channel.udid, passcode: channel.passcode, v4: true });
          } else {

            return oldRedirect.findOldUdid(req.body.udid)
            .then(device => {
                if(device["udid"]) return res.json({ udid: device["udid"], passcode: device["passcode"], v4: false });
                else Promise.reject(new errors.NotFoundError());
              })
              .catch(err => Promise.reject(new errors.NotFoundError()));
          }
        })
        .catch(err => next(err));
    },
    errorHandlers.apiErrorHandler({ sendMessage: false }));


  app.get('/screenshot/:udid/:auth', function(req, res) {
    if(req.params.auth == "123"){
    ss = Screenshot.findOne({udid: req.params.udid}).sort({created_at: -1}).exec(function(err, doc) {
      if(doc) res.render('./../views/screenshot.ejs', {shot: doc})
      else res.send(404)
    })
  } else res.send(401)
  })

  app.get('/screenshot-check/:udid', function(req, res) {
    if(req.params.udid){
      Device.findOne({udid: req.params.udid}, function(err, device) {
          if(err || !device) res.sendStatus(404)
          else res.send(device.request_screenshot)
      })
    } else res.send(404)
  })

  app.post('/screenshot', function(req, res) {
    if(req.body.udid && req.body.shot){
      var ss = new Screenshot({udid: req.body.udid, base64Image: req.body.shot.split("%").join("+")});
      ss.save(function(err, doc) {
          if(err) res.send(501);
          else if(doc){
             res.send(200);
             Device.update({udid: req.body.udid}, {$set: {request_screenshot: false}}).exec();
          }
      })
    } else res.send(401)
  });

  app.get('/api/devices/udid-getter', async (req, res) => {

    const ip = req.query.ip;

    if(ip !== undefined){
      const device = await Device.findOne({ip_assignment: ip})
      if(device) return res.json({udid: device.udid, passcode: device.passcode, v4: true, version: "V4" })  
    } 
    
    return res.json({udid: '', passcode: '0000', v4: true, version: "V4"})
  })
}
