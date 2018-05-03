var Notification = require('../models/notification')

const FEATURES = require('../lib/constants/features');

const notificationsEnabled = rights => {
  return rights.availableFeatures.indexOf(FEATURES.NOTIFICATIONS.TO_ALL_EMAILS) > -1
  || rights.availableFeatures.indexOf(FEATURES.NOTIFICATIONS.TO_ORGANIZATION_USERS) > -1
}

function post(req, res) {
  if(!notificationsEnabled(req.userRights)) return res.status(401).json({error: "No access to the notification feature. Please upgrade your plan."})

  var notification = Object.assign(req.body, {user_id: req.user._id, organization_id: req.userRights.organization_id})
  Notification.create(notification)
  .then(n => {
    res.json(n)
  })
  .catch(e => {
    console.log(e) 
    res.status(500).json({error:e})
  })
}

function put(req, res){
  if(!notificationsEnabled(req.userRights)) return res.status(401).json({error: "No access to the notification feature. Please upgrade your plan."})

  var _id = req.params.id;
  var notification = Object.assign({},req.body);
  delete notification._id
  Notification.update({_id, organization_id: req.user.activeOrganizationId()}, {$set: notification})
  .then(() => res.send(req.body))
  .catch(e => {
    console.log(e) 
    res.status(500).json({error:e})
  })
}

function get(req, res){
 if(!notificationsEnabled(req.userRights)) return res.status(401).json({error: "No access to the notification feature. Please upgrade your plan."})

  const orgadmin = req.userRights.organization_admin;
  var query = {organization_id: req.userRights.organization_id}
  if(!orgadmin) query.user_id = req.user._id;
  Notification.find(query)
  .then(notifications => res.send(notifications))
  .catch(err => {
    console.log(err);
    res.send({error: err})
  })
}

function getById(req, res) {
  if(!notificationsEnabled(req.userRights)) return res.status(401).json({error: "No access to the notification feature. Please upgrade your plan."})

  var query = {organization_id: req.userRights.organization_id, _id: req.params.id}
  const orgadmin = req.userRights.organization_admin;
  if(!orgadmin) query.user_id = req.user._id;

  Notification.findOne(query)
  .then(notification => {
    console.log(notification)
    res.send(notification)
  })
  .catch(err => {
    console.log(err);
    res.send({error: err})
  })
}

function remove(req, res){
  if(!notificationsEnabled(req.userRights)) return res.status(401).json({error: "No access to the notification feature. Please upgrade your plan."})

  var id = req.params.id;
  var orgid = req.userRights.organization_id;
  var query = {_id: id, organization_id: orgid}

  const orgadmin = req.userRights.organization_admin;
  if(orgadmin === false) query.user_id = req.user._id;

  Notification.remove(query).then(result => {
    if(result.result.n > 0) res.sendStatus(200);
    else res.sendStatus(400);
  })
  .catch(err =>{ console.log(err); res.send(err)})

}

module.exports = { post, put, get, getById, remove }
