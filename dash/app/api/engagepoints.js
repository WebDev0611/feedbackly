const Hashids = require('hashids');
const HASHIDS_SALT = process.env.HASHIDS_SALT || 'abcdefg43'
const hashids = new Hashids(HASHIDS_SALT, 4, 'ABCDEFGHJKLMANPQRSTUVWXYZ');
const Organization = require('../models/organization')
const mongoose = require('mongoose')
const LINK = require('../lib/constants/device').deviceTypes.LINK;
const Promise = require('bluebird')
const Device = require('../models/device')
const Devicegroup = require('../models/devicegroup')

const _ = require('lodash')
function generatePin () {
    min = 0,
    max = 9999;
    return ("0" + (Math.floor(Math.random() * (max - min + 1)) + min)).substr(-4);
}

function post(req, res){
  // amount
  var amount = req.body.amount;
  // organization
  var orgid = req.body.organization_id;
  if(!amount || !orgid) return res.status(400).json({error: 'Amount or orgid not specified'})
  var collection = [];

  const Udidsequence = mongoose.connection.db.collection('udidsequence');
  Promise.all([
    Udidsequence.findOne({salt: HASHIDS_SALT}),
    Organization.findOne({_id: orgid}),
  ])
  .spread((seq, org) => {
    if(!seq) return res.status(500).json({error: 'Hashids sequence not found in database'})
    if(!org) return res.status(401).json({error: 'Org not found in database'})

    var hashids_seed_number = seq.number;
    org.passcode = org.passcode ? org.passcode : generatePin();
    Organization.update({_id: org._id}, {$set: {passcode: org.passcode}}).exec()


    _.forEach(new Array(amount), () => {
      hashids_seed_number++;
      var p = Device.create({name: 'Engage point', udid: hashids.encode(hashids_seed_number), type: LINK, passcode: org.passcode, organization_id: org._id, setupDone: false, hashids_seed_number})
      collection.push(p)
    });


    return Promise.all(collection);
  })
  .then(result => {
    if(result) {
      Udidsequence.update({salt: HASHIDS_SALT}, {$inc: {number: result.length}})
      Devicegroup.findOne({organization_id: orgid, is_all_channels_group: true})
      .then(dg => {
        dg.devices = _.uniq([...dg.devices, ..._.map(result, '_id')]);
        dg.save()
      })

    }
    return Promise.resolve(result)
  })
  .then(devices => {
    var udids = _.map(devices, 'udid');
    res.send(udids)
  })
  .catch(err => {
    res.status(500).json({error: err})
  })

}

function getCodes(req, res){
  var range = req.query.range.split(",");
  var r = _.range(range[0], range[1])
  var result = _.map(r, num => {return {num, code: hashids.encode(num)}});
  res.send(result)
}


module.exports = {post, getCodes}
