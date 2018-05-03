const mongoose = require('mongoose');
const oid = mongoose.Types.ObjectId;

async function updateFeedback(content) {
  const Feedback = mongoose.connection.db.collection('feedbacks');

  const updateCommand = {
    $push: {
      notified: {date: new Date(), ruleId: content.notificationRuleId}
    },
  }

  const assignToGroup = content.notificationRule.assignToGroup;
  if(assignToGroup) updateCommand.$addToSet = Object.assign((updateCommand.$addToSet || {}), {
    processedByGroup: {group_id: assignToGroup, processed: false, log: []}
  })

  console.log('updating feedback with')  
  console.log(updateCommand)

  const status = await Feedback.update({_id: oid(content.feedback_id)}, updateCommand);
  console.log('feedback update status', status.result)

  
}

module.exports = {updateFeedback}