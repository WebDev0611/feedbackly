var Promise = require('bluebird');
var dbOperations = require('./db_operations');
var conditionsMatch = require('./conditions_match');
var contentFunc = require('./content');
var sendNotification = require('./send_notification')

const notificationQueue = require('./queue');
const _ = require('lodash')

function handleMessage(fbevent){
    // the main entry point.
    // fbevent = {device_id, feedback_id}
    // returns a Promise with false or the content of a notification
    // if they exist, get Fbevents from database with the feedback_id
    // then match with conditionset

        // get notificationRules from database by device_id

    return Promise.all([
      dbOperations.getNotificationRules(fbevent.device_id, fbevent.survey_id),
      dbOperations.getFbeventsByFeedbackId(fbevent.feedback_id)
    ])
    .spread((notifications, fbevents) => {
        var notificationContentToSend = [];

        notifications.forEach(notification => {
          if(notification.receivers.length > 0){
            const matchConditions = conditionsMatch.matchNotificationRuleToFbevents(notification, fbevents);
            if(matchConditions){
              // conditions match, moving on to handling or delaying. 
              // if delayed, add to queue
              const isLast = _.find(fbevents, {isLast: true}) != undefined
              if(!!(notification.delay > 0 && !isLast)){ // delay is more than >0 and there is no isLast in fbevents
                notificationQueue.addToQueue(notification.delay, notification._id, fbevent.feedback_id);
              } else {
                notificationContentToSend.push(contentFunc.getAllContentFromMatchedFbevents(notification, fbevents));
              }
            }
          }
        });

        return notificationContentToSend
    })
    .then(notiContent => sendNotification.send(notiContent))
    .then(status => console.log(status))
    .then(() => dbOperations.insertHandle(fbevent))

}

notificationQueue.processQueue(async data => {

  try{
    [notification, fbevents] = await Promise.all([
      dbOperations.getNotificationRuleById(data.notificationId), 
      dbOperations.getFbeventsByFeedbackId(data.feedbackId)
    ])

    const status = await sendNotification.send([contentFunc.getAllContentFromMatchedFbevents(notification, fbevents)]);    
    return status
  } catch(e){
    console.log(e)
  }
})

module.exports = { handleMessage }
