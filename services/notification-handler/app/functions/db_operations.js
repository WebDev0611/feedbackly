var Promise = require('bluebird');
const MONGO_URL = process.env.MONGODB_URL;
var client = require('mongodb').MongoClient;
var oid = require('mongodb').ObjectID
var mongoose = require('mongoose');
// gets array of Fbevents with feedback_id from database

function getFbeventsByFeedbackId(feedback_id){
	// returns a promise
	var db = mongoose.connection.db;
	return db.collection('fbevents').find({ feedback_id: oid(feedback_id), filtered: {$ne: true} }).toArray()
}

// MongoDB get notifications rules from database by device_id

function getNotificationRules(device_id, survey_id){
  	// returns a promise
		const query = { device_id: oid(device_id), survey_id: oid(survey_id)};
		var db = mongoose.connection.db;
		return db.collection('notifications').find(query).toArray()
}

function insertHandle(fbevent){
	const query = {feedback_id: oid(fbevent.feedback_id),
		organization_id: oid(fbevent.organization_id),
		device_id: oid(fbevent.device_id), sent: Date.now()/1000}
		var db = mongoose.connection.db;
		return db.collection('notificationreceipts').insert(query)
}

function alreadySent(fbid, ruleId, db){
	var feedback_id = oid(fbid)
	var notificationRuleId = oid(ruleId)
	var connection = mongoose.connection.db || db;	
	return connection.collection('notificationsSent')
	.findOne({feedback_id , notificationRuleId})
	.then(obj => {
		const isSent = obj ? true : false;
		if(isSent) console.log('Notification already sent');
		return isSent;
	})
}

function updateAsSent(fbid, ruleId, db){
	var feedback_id = oid(fbid)
	var notificationRuleId = oid(ruleId)
	var connection = mongoose.connection.db || db;
	return connection.collection('notificationsSent')
	.update({feedback_id , notificationRuleId},
		{$set: {feedback_id , notificationRuleId, created_at: new Date()}},
		{upsert: true})
}

function getNotificationRuleById(ruleId){
	return mongoose.connection.db.collection('notifications').findOne({_id: oid(ruleId)})
}


module.exports = { getFbeventsByFeedbackId, getNotificationRules, insertHandle, alreadySent, updateAsSent, getNotificationRuleById}
