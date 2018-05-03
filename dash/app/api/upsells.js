var Upsell = require('../models/upsell');
var Device = require('../models/device');
var _ = require('lodash')

function get(req, res){
  var oid = req.user.activeOrganizationId()


  Upsell.find({organization_id: oid})
  .then(upsells => res.send(upsells))
  .catch(err => res.send(err))
}

function post(req, res){
  // validate etc
  var upsell = req.body;

  upsell.organization_id = req.user.activeOrganizationId()
  upsell.created_by = req.user._id;

  Upsell.create(upsell)
  .then(doc => res.send(doc))
  .catch(err => res.status(500).send(err))
}

function getById(req, res) {
  var _id = req.params.id;
  var oid = req.user.activeOrganizationId()

  Upsell.findOne({_id, organization_id: oid})
  .then(upsell => res.send(upsell))
  .catch(err => res.send(err))
}

function put(req, res){
  var _id = req.params.id
  var oid = req.user.activeOrganizationId()
  Upsell.update({_id, organization_id: oid}, {$set: req.body})
  .then(() => res.send(200))
  .catch(err => res.send(err))
}

function remove(req, res){
  var _id = req.params.id;
  var oid = req.user.activeOrganizationId()

  _.forEach(['positive', 'negative', 'neutral'], target => {
    Device.update({[`upsells.${target}`]: _id}, {$set: {[`upsells.${target}`]: null}}, {multi: true})
    .then(r => console.log(r))
  })


  Upsell.remove({_id, organization_id: oid})
  .then(() => res.send(200))
  .catch(err => res.send(err))
}

function activate(req, res){
  var id = req.params.id;
  var target = req.body.target;
  if(!id || !target) return res.status(400).json({error: 'id or target missing'});

  var myDevices = req.userRights.devices;
  var active = _.filter(req.body.activations.active, d => myDevices.indexOf(d) > -1)
  var notActive = _.filter(req.body.activations.notActive, d => myDevices.indexOf(d) > -1)

  Promise.all([
    Device.update({_id: {$in: active}}, {$set: {[`upsells.${target}`]: id}}, {multi:true}),
    Device.update({_id: {$in: notActive},[`upsells.${target}`]: id}, {$set: {[`upsells.${target}`]: null}}, {multi:true})
  ])
  .then(sult => {
    console.log(sult);
    res.sendStatus(200);
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({error: err})
  })

}

module.exports = { get, post, getById, put, remove, activate }
