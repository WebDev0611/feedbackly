var Fbevent = require('../models/fbevent');
var Feedback = require('../models/feedback');
var Promise = require('bluebird')
var _ = require('lodash')

function deleteByFeedbackId(req, res){
  var feedback_id = req.params.id;
  var organization_id = req.userRights.organization_id;

  Promise.all([
    Fbevent.remove({feedback_id, organization_id}),
    Feedback.remove({_id: feedback_id, organization_id})
  ])
  .then(a => {
    console.log(`User ${req.user.email} deleted Feedback ${feedback_id}`)
    res.send(a[0])
  })
  .catch(err => console.log(err))

}

module.exports = { deleteByFeedbackId }
