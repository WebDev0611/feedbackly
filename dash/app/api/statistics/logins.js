const mongoose = require('mongoose');

const findFromRange = params => {
  if(params && params.fromDate && params.toDate){
    return {
      $match: {sign_in: {$gt: params.fromDate, $lt: params.toDate}}
    }
  }
}

async function getLastLoginInOrganizations(params){
    try{
    const SignIns = mongoose.connection.db.collection("usersignins");

    let pipeline = [
      { $sort: { sign_in: 1 } },
      {
        $group:
          {
            _id: "$organization_id",
            lastLoginDate: { $last: "$sign_in" }
          }
      }
    ]

    findFromRange(params) ? pipeline.unshift(findFromRange(params)) : null;


    const signInsObject = await SignIns.aggregate(pipeline).toArray();

    return signInsObject;
  } catch(e){
    console.log('ERROR in logins.js')
    console.log(e)
}
}

async function getNumberOfLogins(params){
  try{
    const SignIns = mongoose.connection.db.collection("usersignins");

    let pipeline = [
      { 
        $group: {
            _id: {organization_id: "$organization_id"},
            count: {$sum: 1}
        }
      }
    ]

    findFromRange(params) ? pipeline.unshift(findFromRange(params)) : null;    

    const signInCounts = await SignIns.aggregate(pipeline).toArray();

    return signInCounts;
  } catch(e){
    console.log('ERROR in logins.js // getNumberOfLogins')
    console.log(e)
}
    
}

module.exports = {getLastLoginInOrganizations, getNumberOfLogins}