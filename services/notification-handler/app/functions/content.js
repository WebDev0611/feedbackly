function getAllContentFromMatchedFbevents(notificationRule, fbevents){
  // this gets the content to send from Fbevents.
  // match questionId from the notification rule to the fbevent of the same question id
  // and get the data field. created_at_adjusted_ts comes from the first matched fbevent

  var allContent = [];
  
  if(notificationRule.messageContentFromQuestionIds && notificationRule.messageContentFromQuestionIds.length > 0){
    var questionIds = notificationRule.messageContentFromQuestionIds.map(id => id.toString())
    allContent = fbevents.filter(fbe => questionIds.indexOf(fbe.question_id.toString()) > -1)
  } else allContent = fbevents;


  return {
  	feedback_id: fbevents[0].feedback_id,
  	created_at_adjusted_ts: fbevents[0].created_at_adjusted_ts,
  	data: allContent,
    receivers: notificationRule.receivers,
    notificationRule,
  	notificationRuleId: notificationRule._id,
    survey_id: fbevents[0].survey_id,
    device_id: fbevents[0].device_id
  }
}

 module.exports  = {getAllContentFromMatchedFbevents}
