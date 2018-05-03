var Basetranslation = require('../base-translation')
var Devicegroup = require('../devicegroup')
var Device = require('../device');
var Fbevent = require('../fbevent');
var Notification = require('../notification')
var Organizationright = require('./organization-right')
var Question = require('../question');
var Survey = require('../survey');
var User = require('../user');
var Organization = require('./index')
var Promise = require('bluebird')
var intercom = require('../../lib/intercom')

function destroyOrganization(id){
  if(!id) return false;
  var query = {$or: [{organization_id: id}, {organization: id}]}
  var promises = [
    Basetranslation.remove(query),
    Devicegroup.remove(query),
    Device.remove(query),
    Fbevent.remove(query),
    Notification.remove(query),
    Organizationright.remove(query),
    Question.remove(query),
    Survey.remove(query),
    User.remove({$and: [{organization_id: {$size: 1}},{organization_id:id}]}),
    Organization.remove({_id: id})
  ];
  return User.find({$and: [{organization_id: {$size: 1}},{organization_id:id}]})
  .then(users => {
    users.forEach(user => {
      intercom.deleteUser(user._id.toString())
    })
    return Promise.all(promises);
  })
}

module.exports = destroyOrganization;
