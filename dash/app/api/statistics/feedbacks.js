const mongoose = require('mongoose')

async function getFeedbackAmount(params){
    try{
    const Feedback = mongoose.connection.db.collection("feedbacks");

    const aggr = [
        { $group: {
          _id: {organization_id: "$organization_id"},
          count: {$sum: 1}
         }
        }
    ]

    if(params && params.fromDate && params.toDate){
        aggr.unshift({$match: {created_at: {$gt: params.fromDate, $lt: params.toDate}}});
    }

    const feedbackCounts = await Feedback.aggregate(aggr).toArray();
        
    return feedbackCounts;
    } catch(e){
        console.log('ERROR in feedbacks.js')
        console.log(e)
    }
}

module.exports = { getFeedbackAmount }