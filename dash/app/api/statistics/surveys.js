const mongoose = require('mongoose');

async function getSurveyAmount(params){
  try{
    const Surveys = mongoose.connection.db.collection("surveys");

    let match = {generated: false};

    if(params && params.fromDate && params.toDate){      
      match = Object.assign(match, {created_at: {$gt: params.fromDate, $lt: params.toDate}});
    }
    
    const surveyCounts = await Surveys.aggregate([
        { 
          $match: match,
        },
        { $group: {
          _id: {organization_id: "$organization"},
          count: {$sum: 1}
         }
        }
    ]).toArray();

    return surveyCounts;
  } catch(e){
    console.log('ERROR in surveys.js // getSurveyAmount')
    console.log(e)
}
}



module.exports = { getSurveyAmount }