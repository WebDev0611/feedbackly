var mongoose = require('mongoose');
var _ = require('lodash');
var moment = require('moment');
var ObjectID = require('mongodb').ObjectID;

async function post(req,res) {
  var id = req.query.id;
  var email =  _.get(await mongoose.connection.db.collection('marketing_contacts').findOne({_id: ObjectID(id)}), 'email');

  var newObj = {unsubscribeAll: true, orgs: []};

  var contacts = await mongoose.connection.db.collection('marketing_contacts').find({email}).toArray();
  var org_ids = _.keyBy(_.uniq(contacts.map(c => c.organization_id)));

  _.forEach(req.body, (val,key) => {
    if(key=='all') newObj.unsubscribeAll = (val !== 'on');
    else if(val=='on') delete org_ids[key];
  });

  newObj.orgs = _.keys(org_ids);
  newObj.last_updated = new Date();

  await mongoose.connection.db.collection('marketing_unsubscribes').update({email}, {$set: newObj}, {upsert: true });
  res.redirect(req.originalUrl);
}

async function unsubscribe(req,res) {

  if(req.method == 'POST') {
    return await post(req,res);
  }

  var id = req.query.id;
  var email =  _.get(await mongoose.connection.db.collection('marketing_contacts').findOne({_id: ObjectID(id)}), 'email');
  if(!email) return res.send('This email is not in the database.');

  var contacts = await mongoose.connection.db.collection('marketing_contacts').find({email}).toArray();
  var org_ids = _.uniq(contacts.map(c => c.organization_id));

  var orgs = await mongoose.connection.db.collection('organizations').find({_id: {$in: org_ids}}).toArray();

  orgMap = _.keyBy(orgs,'_id');



  var unsub = await mongoose.connection.db.collection('marketing_unsubscribes').findOne({email});
  var unsubMap = {};
  if(unsub) unsubMap = _.keyBy(unsub.orgs || []);
  var globalUnsubscribe = !!_.get(unsub, 'unsubscribeAll');

  var orgData = _.map(_.keys(orgMap), org_id => ({
    id: org_id,
    name: orgMap[org_id].name,
    unsubscribed: org_id in unsubMap
   }));

  res.render('unsubscribe.ejs', {
    globalUnsubscribe,
    orgData
  });
}


module.exports = unsubscribe;
