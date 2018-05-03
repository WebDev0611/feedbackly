var Promise = require('bluebird')
var dbOperations = require('./db_operations')
var Email = require('./email')
const updateFeedback = require('./update_feedback').updateFeedback;
const _ = require('lodash')

function send(content){
  	// add alreadySent check here
    var promises = [];
    
    content.forEach(c => {

      if(c.data.length > 0){
        var p = 
        dbOperations.alreadySent(c.feedback_id, c.notificationRuleId)
        .then(result =>
          {
            if(result == true) return true;
            else return Promise.all([
              Email.send(c),
              updateFeedback(c)
            ])
          }
        ).then(result => {
          if(_.isArray(result)) return result[0];
          else return result
        })
        promises.push(p)
      }
    })

    return Promise.all(promises)
}

module.exports = { send }
