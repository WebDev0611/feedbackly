var fs = require('fs');
var byline = require('byline');
var q = require('q');
var objectId = require('bson-objectid');

var auth = require('../lib/auth');
var middlewares = require('../lib/middlewares');
var validator = require('../lib/request-validator');
var questionEmails = require('./question-emails');
var TinyLink = require('../models/tinylink');
var MiniId = require('../lib/mini-id');

var Organization = require('../models/organization');
var Mailinglistaddress = require('../models/device/mailinglistaddress');
var Device = require('../models/device');

var	_ = require('lodash');
var	enc = require('../lib/encryption');
var render = require('../lib/render');
var rights = require('../lib/rights');

var parseCsv = require('../lib/csv-parser');

var fs = require('fs');
var enc = require('../lib/encryption');
var ObjectId = require('mongoose').Types.ObjectId;
function validateEmail(mail){  
 return (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
} 

module.exports = function(app) {

	app.delete('/api/mailinglist_addresses/:id',
		auth.isLoggedIn(),
		middlewares.findById('MailinglistAddress', req => req.params.id),
		auth.canAccessDevices(req => [req.targetMailinglistAddress.mailinglist_id]),
		(req, res) => {
			req.targetMailinglistAddress.remove()
				.then(() => rights.cacheBust(req.user))
				.then(() => res.sendStatus(200))
				.catch(err => render.error(req, res, { err }));
		});

		app.put('/api/mailinglist_addresses/:id',
	    auth.isLoggedIn(),
	    middlewares.findById('MailinglistAddress', req => req.params.id),
	    auth.canAccessDevices(req => [req.targetMailinglistAddress.mailinglist_id]),
	    async (req, res) => {
	        var ok = await req.targetMailinglistAddress.update({
	          fname: enc.encrypt(req.body.fname),
	          lname: enc.encrypt(req.body.lname),
	          email: enc.encrypt(req.body.email)
	        });
	        if(ok) res.sendStatus(200);
	        else res.sendStatus(500);
	    });

	app.get('/api/mailinglists/:id/count',
		auth.isLoggedIn(),
		auth.canAccessDevices(req => [req.params.id]),
		(req, res) => {
			Mailinglistaddress.count({mailinglist_id: req.params.id, unsubscribed: false})
			.then(count => res.json({count}))
			.catch(res.sendStatus(500))
		}
	)

	app.get('/api/mailinglists/:id/addresses',
		auth.isLoggedIn(),
		auth.canAccessDevices(req => [req.params.id]),
		middlewares.paginator({
			model: Mailinglistaddress,
			query: (req) => { return { mailinglist_id: req.params.id } },
			sort: { _id: -1 }
		}));

	app.post('/api/mailinglists/:id/addresses', auth.isLoggedIn(), auth.canAccessDevices(req => [req.params.id]), function(req, res) {
		var address = new Mailinglistaddress(_.assign(Mailinglistaddress.populatableAttributes(req.body), { mailinglist_id: req.params.id }));

		address.save(err => {
			if(err) {
				render.error(req, res, { err })
			} else {
				rights.cacheBust(req.user)
				.then(() => {
					res.json(address);
				})
			}
		});
	});

	app.post('/api/mailinglists/:id/upload',
	auth.isLoggedIn(),
	auth.canAccessDevices(req => [req.params.id]),
	async (req, res) => {
		// Skip validation to make a fast bulk insert for the whole dataset
		// In case there are no entries on this device, we can perform a bulk insert
		// Otherwise we should perform a bulk upsert operation
		// Future next step for optimization: read csv as a stream and do a bulk DB operation every 100 lines
		var firstUpload = (await Mailinglistaddress.count({mailinglist_id: ObjectId(req.params.id)})) === 0;
		var seed  = (await Device.findOne({_id: ObjectId(req.params.id)})).contact_id_seed || 0;

		var path = _.get(req, 'files.file.path');

		try {
			var data = await parseCsv(path,3);
		} catch(err) {
			console.error(err);
			res.sendStatus(400);
			return;
		}

		var errors = []
		var row=0;
		var docs = data.map(d => {
			row++;
			if(d.fname && d.lname && d.email && d.fname.length > 0 && d.lname.length  > 0 && validateEmail(d.email)){
				try{
					var obj = {
						fname: enc.encrypt(d.fname),
						lname: enc.encrypt(d.lname),
						email: enc.encrypt(d.email),
						mailinglist_id: ObjectId(req.params.id),
						unsubscribed: false
					}
					_.forEach(d, (val, key) => {
						if(key.indexOf('meta_') >-1){
							obj.meta = Object.assign({}, obj.meta, {[key.split("meta_")[1]]: val})
						}
					})
	
					if(obj.meta) obj.shortid = MiniId.generate(seed++)
				}catch(e){
					console.error(e)
					errors.push({code: 400, obj: d, row})

				}

			} else {
				errors.push({type: 400, obj: d, row})
			}

			return obj
		})
		.filter(o => o !== undefined)

		if(docs.length === 0) {
			res.status(400).send(errors);
			console.error('No entries in CSV');
			return;
		}

		if(errors.length > 0){
			res.status(200)
		}

		const onInsert = (err, docs) => {
			if(err) {
				res.status(500).send(errors);
				console.log(err);
			}
			res.status(200).send(errors)
		}

		Device.update({_id: ObjectId(req.params.id)}, {$set: {contact_id_seed: seed}}).exec()

		if(firstUpload) Mailinglistaddress.collection.insert(docs,onInsert);
		else {
			var bulk = Mailinglistaddress.collection.initializeOrderedBulkOp();
			_.forEach(docs, doc => {
				const payload = {
					$set: {fname: doc.fname, lname: doc.lname, meta: doc.meta},
					$setOnInsert: {unsubscribed: false}
				}
				if(doc.shortid) payload.$setOnInsert.shortid = doc.shortid;
				bulk.find({email: doc.email, mailinglist_id: doc.mailinglist_id}).upsert()
				.updateOne(payload);
			});
			bulk.execute(onInsert);
		}

	});



		app.post('/api/mailinglists/:id/send',
			validator.bodyRequirements(['question.question_type', 'language', 'subject', 'fromEmail', 'fromName', 'surveyId']),
			auth.isLoggedIn(),
			auth.canAccessDevices(req => [req.params.id]),
			async (req, res) => {
				try{
					await questionEmails.sendSurveyAsEmail(req.body,[req.params.id]);
					res.send(200)
				} catch(e){
					console.log(e);
					res.status(500).send({error: e})
				}

			});


	app.post('/api/mailinglists/:id/send/api-key',
		validator.bodyRequirements(['question.question_type', 'translation', 'subject', 'fromEmail', 'fromName', 'surveyId']),
		auth.hasValidApiKey(req => req.body.apiKey),
		(req, res)=>{
			questionEmails.sendSurveyAsEmail(req.body,[req.params.id]).then(() => res.send(200))
			.catch(err => {console.log(err); res.sendStatus(500)});
		});


	app.get('/api/mailinglists/:list_id/unsubscribe/:email', function(req, res){
		Mailinglistaddress.update({ mailinglist_id: req.params.list_id, email: req.params.email }, { unsubscribed: true }, { multi: true })
			.exec()
			.then(() => res.send('You have been unsubscribed from the mailinglist'))
			.catch(() => res.sendStatus(500));
	});
}
