const mongoose = require('mongoose')

async function getOrganizationDetails(params){
    try{

    const Organization = mongoose.connection.db.collection("organizations");

    let query = {}

    if(params && params.fromDate && params.toDate){
       query.created_at = {$gt: params.fromDate, $lt: params.toDate}
    }
    
    const orgs = await Organization.find(query).sort({created_at:-1}).toArray();
    return orgs
    } catch(e){
    console.log('ERROR in logins.js // getOrganizationDetails')
    console.log(e)
}
}

module.exports = {getOrganizationDetails}
