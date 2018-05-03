const mongoose = require('mongoose');
const oid = require('mongoose').Types.ObjectId;
const _ = require('lodash');

function getOrganizationUserSignIns(id){
  const pipeline = [{ $match: { organization_id: oid(id) } }, { $group: { _id: { user_id: "$user_id" }, count: { $sum: 1 } } }]
  return mongoose.connection.db.collection("usersignins").aggregate(pipeline).toArray()
}

async function addSignInCounts(users, orgid){
  const userSignIns = await getOrganizationUserSignIns(orgid);
  const newUsers = users.map(user => {
    const signins = _.find(userSignIns, {_id: {user_id: user._id}});
    if(signins) return Object.assign({}, user, {signInCount: signins.count});
    else return user;
  })
  return newUsers;
}

module.exports = {
  getOrganizationUserSignIns,
  addSignInCounts
}