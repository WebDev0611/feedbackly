const mongoose = require('mongoose')

async function getUserAmount(params){
    try{
    const User = mongoose.connection.db.collection("users");

    const pipeline = [
        {$unwind: {path: "$organization_id"}},
        {$group: {
            _id: {organization_id: "$organization_id"},
            count: {$sum: 1}
        }}
    ];

    if(params && params.fromDate && params.toDate){      
        pipeline.unshift({$match: {member_since: {$gt: params.fromDate, $lt: params.toDate}}})
    }

    const userCount = await User.aggregate(pipeline).toArray()
    return userCount
    } catch(e){
        console.log('ERROR in users.js // getUserAmount')
        console.log(e)
    }
}

module.exports = {getUserAmount}