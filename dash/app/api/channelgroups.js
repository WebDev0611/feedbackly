const Devicegroup = require('../models/devicegroup');
const Device = require('../models/device');
const _ = require('lodash');

function post(req, res){
  var body = req.body;
  var organization_id = req.body.organization_id && req.user.system_admin
  ? req.body.organization_id
  : req.userRights.organization_id;

  // Take only the devices that exist in the organization
  Device.find({_id: {$in: body.devices}, organization_id}).select({_id: 1})
  .then(ids => {
    var devices = ids || [];
    return Devicegroup.create({
      name: body.name,
      devices: body.devices || [],
      organization_id
    })
  })
  .then(dg => res.status(201).json(dg))
  .catch(err => res.status(500).json({error: err}));
}

function getById(req, res){
  if(req.params.id === 'all') return getAllChannelsGroup(req, res);

  var dg = _.find(req.userRights.devicegroupObjects, {_id: req.params.id});
  if(dg) res.json(dg)
  else res.sendStatus(404);
}

function getAll(req, res){
  res.send(req.userRights.devicegroupObjects || []);
}

function getAllChannelsGroup(req, res){
  if(req.userRights && req.userRights.allChannelsGroup) res.send(req.userRights.allChannelsGroup);
  else res.sendStatus(404);
}

function updateById(req, res){
  var body = req.body;
  var organization_id = req.body.organization_id && req.user.system_admin
  ? req.body.organization_id
  : req.userRights.organization_id;

  Device.find({_id: {$in: body.devices}, organization_id}).select({_id: 1})
  .then(ids => {
    var payload = {
      name: body.name,
      devices: _.map(ids, '_id')
    }
    const query = {_id: req.params.id, organization_id, is_all_channels_group: {$ne: true}};
    const operation = {$set: payload}
    console.log(query, operation)
    return Devicegroup.update(query, operation)
  })
  .then(() => res.send({_id: req.params.id}))
  .catch(err => res.status(500).json({error: err}));
}

function deleteById(req, res){
  var query = {_id: req.params.id};
  !req.user.system_admin ? query.organization_id = req.userRights.organization_id : false;
  Devicegroup.remove(query)
  .then(msg => {res.send(msg)})
  .catch(err => res.status(500).json({error: err}))
}

module.exports = { post, getById, getAll, updateById, deleteById }
