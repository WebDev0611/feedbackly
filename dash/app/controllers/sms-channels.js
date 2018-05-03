var auth = require('../lib/auth');
var clientLink = require('../lib/client-link');
var middlewares = require('../lib/middlewares');
var validator = require('../lib/request-validator');
var Device = require('../models/device');
var SmsContact = require('../models/device/smscontact');
var TinyLink = require('../models/tinylink');
var render = require('../lib/render');
var SmsDeliveryReceipt = require('../models/sms-delivery-receipt')
var _ = require('lodash')
var smsMessages = require('./sms-messages')
var csv = require('csv-parse');
var fs = require('fs');
var enc = require('../lib/encryption');
var ObjectId = require('mongoose').Types.ObjectId;
var parseCsv = require('../lib/csv-parser');
var mongoose = require('mongoose')

const MiniId = require('../lib/mini-id');
var Sms = require('../api/sms')

var sendSmsValidator = {
  'surveyId': (value) => value !== undefined,
  'textBody': (value) => value !== undefined && value.length > 0
};

module.exports = (app) => {
  app.get('/api/sms_channels/:id/contacts',
    auth.isLoggedIn(),
    auth.canAccessDevices(req => [req.params.id]),
    middlewares.paginator({
      model: SmsContact,
      query: (req) => { return { device_id: req.params.id } },
      sort: { _id: -1 }
    }));

  app.post('/api/sms_channels/:id/contacts',
    auth.isLoggedIn(),
    auth.canAccessDevices(req => [req.params.id]),
    (req, res) => {
      var attributes = SmsContact.populatableAttributes(req.body);
      attributes.device_id = req.params.id;

      var newContact = new SmsContact(attributes);

      newContact.save()
        .then(() => res.json(newContact))
        .catch(error => res.status(400).json({ error }));
    });

  app.post('/api/sms_channels/:id/send',
    auth.isLoggedIn(),
    validator.bodyRequirements(sendSmsValidator),
    auth.canAccessDevices(req => [req.params.id]),
    (req, res) => {
      var payload = _.assign({devices: [req.params.id]}, req.body, {organizationId: req.user.activeOrganizationId(), user_id: req.user._id, batchId: MiniId.generate(Date.now())});
      Sms.send(payload)
      .then(info => {
        if(info.error) res.setStatus(400).json(info);
        else res.sendStatus(200)
      })
      .catch(err => { console.log(err); res.send(500); })
    })

  app.post('/api/sms_channels/:id/send/api-key',
    auth.hasValidApiKey(req => req.body.apiKey),
    validator.bodyRequirements(sendSmsValidator),
    (req, res) => {
      var payload = _.assign({devices: [req.params.id]}, req.body);
      smsMessages.sendSurveyAsSms(payload, { hasApiKey: true})
      .then(info => {
        if(info.error) res.setStatus(400).json(info);
        res.sendStatus(200)
      })
      .catch(err => { console.log(err); res.send(500); })
    })

  app.post('/api/sms_channels/:id/upload',
    auth.isLoggedIn(),
    auth.canAccessDevices(req => [req.params.id]),
    async (req, res) => {
  		// Skip validation to make a fast bulk insert for the whole dataset
  		// In case there are no entries on this device, we can perform a bulk insert
  		// Otherwise we should perform a bulk upsert operation
  		// Future next step for optimization: read csv as a stream and do a bulk DB operation every 100 lines
  		var firstUpload = (await SmsContact.count({device_id: ObjectId(req.params.id)})) === 0;
      var seed  = (await Device.findOne({_id: ObjectId(req.params.id)})).contact_id_seed || 0;

  		var onInsert = (err,docs) => {
  			if(err) {
          res.sendStatus(500);
          console.error(err);
          console.error(err.getOperation());
        }
  			else res.sendStatus(200);
  		};

  		var path = _.get(req, 'files.file.path');

  		try {
  			var data = await parseCsv(path,3);
  		} catch(err) {
  			console.error(err);
  			res.sendStatus(500);
  			return;
  		}

      var docs = data.map(d => {
        try{
          var obj = {
            fname: enc.encrypt(d.fname),
            lname: enc.encrypt(d.lname),
            phone_number: enc.encrypt(d.phone_number),
            device_id: ObjectId(req.params.id)
          }

          _.forEach(d, (val, key) => {
            if(key.indexOf('meta_') >-1){
              obj.meta = Object.assign({}, obj.meta, {[key.split("meta_")[1]]: val})
            }
          })
         obj.shortid = MiniId.generate(seed++)
        }catch(e){
          console.error(e)
          // add error handling here

        }
        return obj;
      })
      .filter(o => o !== undefined)



  		if(docs.length === 0) {
  			res.sendStatus(500);
  			console.error('No entries in CSV');
  			return;
  		}

      Device.update({_id: ObjectId(req.params.id)}, {$set: {contact_id_seed: seed}}).exec()

  		if(firstUpload) SmsContact.collection.insert(docs,onInsert);
  		else {
  			var bulk = SmsContact.collection.initializeOrderedBulkOp();
  			_.forEach(docs, doc => {
  				bulk.find({phone_number: doc.phone_number, device_id: doc.device_id}).upsert()
  				.updateOne({$set: {fname: doc.fname, lname: doc.lname, meta: doc.meta, shortid: doc.shortid}});
  			});
  			bulk.execute(onInsert);
  		}

  	});


  app.delete('/api/sms_contacts/:id',
    auth.isLoggedIn(),
    middlewares.findById('SmsContact', req => req.params.id),
    auth.canAccessDevices(req => [req.targetSmsContact.device_id]),
    (req, res) => {
      req.targetSmsContact.remove()
        .then(() => res.sendStatus(200))
        .catch(err => render.error(req, res, { err }));
    });

  app.put('/api/sms_contacts/:id',
    auth.isLoggedIn(),
    middlewares.findById('SmsContact', req => req.params.id),
    auth.canAccessDevices(req => [req.targetSmsContact.device_id]),
    async (req, res) => {
        var ok = await req.targetSmsContact.update({
          fname: enc.encrypt(req.body.fname),
          lname: enc.encrypt(req.body.lname),
          phone_number: enc.encrypt(req.body.phone_number)
        });
        if(ok) res.sendStatus(200);
        else res.sendStatus(500);
    });
}
