const _ = require("lodash");
const mongoose = require("mongoose");
const jwt = require("jwt-simple");
const User = require("../models/user");
const Organization = require('../models/organization');
const Organizationright = require("../models/organization/organization-right");
const Channelgroup = require("../models/devicegroup");
const JWT_SECRET = process.env.JWT_SECRET;
const oid = mongoose.Types.ObjectId;
const addSignInCounts = require('../lib/signins').addSignInCounts;

const FEATURES = require('../lib/constants/features')

async function _hasApiAccess(organizationId) {
  const organization = await Organization.findById(organizationId);
  return organization.hasFeature(FEATURES.REST_API);
}

async function generateApiKey(req, res) {
  const organizationId = req.user.activeOrganizationId();
  const hasApiAccess = await _hasApiAccess(organizationId)
  if (!hasApiAccess) res.status(401).json({ error: "No API access for organization" });

  const userId = req.params.id;

  try {
    const user = await User.findOne({
      _id: userId,
      organization_id: organizationId
    });
  } catch (e) {
    res.status(404).json({ error: "User not found." });
  }

  const body = {
    api_key_id: oid().toString(),
    organization_id: organizationId.toString(),
    user_id: userId.toString(),
    expiration_date: 9999999999999
  };

  const jwtString = jwt.encode(body, JWT_SECRET);

  const key = await mongoose.connection.db.collection("apikeys").insertOne({
    _id: oid(body.api_key_id),
    organization_id: oid(body.organization_id),
    user_id: oid(body.user_id),
    revoked: false,
    jwt: jwtString,
    created_at: new Date()
  });

  res.send({ jwt: jwtString });
}

async function getApiKeys(req, res) {
  const organizationId = req.user.activeOrganizationId();
  const hasApiAccess = await _hasApiAccess(organizationId)
  if (!hasApiAccess) res.status(401).json({ error: "No API access for organization" });

  const userId = req.params.id;

  try {
    const user = await User.findOne({
      _id: userId,
      organization_id: organizationId
    });
  } catch (e) {
    res.status(404).json({ error: "User not found." });
  }

  const query = {
    organization_id: oid(organizationId),
    user_id: oid(userId)
  };

  const keys = await mongoose.connection.db
    .collection("apikeys")
    .find(query, { organization_id: 0, user_id: 0, created_at: 0 })
    .sort({ created_at: 1 })
    .toArray();
  res.send(keys);
}

async function revokeApiKey(req, res) {
  const organizationId = req.user.activeOrganizationId();
  const hasApiAccess = await _hasApiAccess(organizationId)
  if (!hasApiAccess) res.status(401).json({ error: "No API access for organization" });

  const userId = req.params.id;

  const api_key_id = req.params.apikey;

  const { revoke } = req.body;
  if (revoke != undefined) {
    const query = {
      user_id: oid(userId),
      organization_id: oid(organizationId),
      _id: oid(api_key_id)
    };
    await mongoose.connection.db
      .collection("apikeys")
      .update(query, { $set: { revoked: revoke } });
    res.sendStatus(200);
  } else res.sendStatus(400);
}

async function get(req, res) {
  try {
    const orgid = req.user.activeOrganizationId();
    if (!req.user.isOrganizationAdminOf(orgid)) return res.sendStatus(401);
    const users = await User.find({ organization_id: orgid });
    const rights = await Organizationright.find({
      user_id: { $in: users.map(u => u._id) },
      organization_id: orgid
    });
    let returnable = users.map(u => {
      const right = _.find(rights, { user_id: u._id });
      const obj = _.omit(
        Object.assign({}, u.toObject(), rights.rights),
        "email_confirmed ipadSignupToken ipad_user password tutorial_finished tutorials_finished system_admin".split(
          " "
        )
      );
      obj.organization_admin = obj.organization_admin.map(s => s.toString()).indexOf(orgid.toString()) > -1
      return obj;
    });
    returnable = await addSignInCounts(returnable, orgid)

    res.send(returnable);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "Something went wrong" });
  }
}

async function postPut(req, res) {
  const organizationId = req.user.system_admin ? mongoose.Types.ObjectId(req.query.org || req.user.activeOrganizationId()) : req.user.activeOrganizationId()
  let userId = req.params.id ? mongoose.Types.ObjectId(req.params.id) : mongoose.Types.ObjectId();

  const isNew = req.params.id === undefined;

  const userInAnotherOrg = isNew ? await User.findOne({ email: req.body.email }) : undefined;
  if (userInAnotherOrg) userId = userInAnotherOrg._id;


  if (isNew) {
    let isValid;
    try {
      isValid = (
        req.body.displayname.length > 0 &&
        req.body.email.indexOf('@') > -1
      )
      if (!isValid) return res.status(400).send({ error: 'Check your input' })
    } catch (e) {
      return res.status(400).send({ error: 'Check your input' })
    }
  }

  if(_.get(req, 'body.email')) req.body.email = req.body.email.toLowerCase()

  let editableAttributes = ""
  // check that requester is system admin or organization admin in the organization where these changes are made
  // basic user
  if (userId == req.user._id) {
    editableAttributes = "default_organization displayname settings password"
  }
  // org admin
  if (req.user.isOrganizationAdmin() && req.user.activeOrganizationId().toString() === organizationId.toString()) {
    editableAttributes = "default_organization displayname email organization_admin settings tutorials_finished rights password"
  }
  // system admin
  if (req.user.system_admin) {
    editableAttributes = "default_organization displayname email organization_admin settings tutorials_finished rights password"
  }
  const user = _.pick(req.body, editableAttributes.split(" "))

  if (user.password) user.password = User.generateHash(user.password)
  else if (isNew && !userInAnotherOrg) {
    user.password = User.generateHash(Date.now())
    user.member_since = new Date()
  }

  const userRights = user.rights ? Object.assign({}, user.rights) : null;
  const query = { $addToSet: {} }
  if (user.organization_admin != undefined) {
    if (user.organization_admin == false) query.$pull = { organization_admin: organizationId };
    else query.$addToSet.organization_admin = organizationId
  }

  query.$addToSet.organization_id = organizationId;

  delete user.rights
  delete user.organization_admin;

  query.$set = user;
  const result = await User.update({ _id: userId }, query, { upsert: true });

  if (userRights) {
    const channelGroupIds = userRights.devicegroups;
    const channelgroups = await Channelgroup.find({ _id: { $in: channelGroupIds } });
    userRights.devicegroups = channelgroups.map(cg => cg._id); /// security measure
    const orResult = await Organizationright.update({ user_id: userId, organization_id: organizationId }, { $set: { rights: userRights } }, { upsert: true });
  }

  const upsertedId = _.get(result, 'upserted[0]._id');

  res.send({ _id: upsertedId ? upsertedId : userId })

}

async function ping(req, res) {
  res.status(200).json({ ping: new Date() })
}

async function deleteUser(req, res){
  const systemAdmin = !!req.user.system_admin;
  const organizationId =  systemAdmin ? mongoose.Types.ObjectId(req.query.org || req.user.activeOrganizationId()) : req.user.activeOrganizationId()
  
  if(!systemAdmin && !req.user.isOrganizationAdminOf(organizationId)) return res.status(401).json({error: 'Unauthorized to delete user.'})

  let userId;
  try{
    userId = mongoose.Types.ObjectId(req.params.id)
  } catch(e){ return res.status(400).json({error: 'Invalid user id'})}

  const user = await User.findOne({_id: userId});
  console.log(user, organizationId)
  if(user.isInOrganization(organizationId)){
    if(user.organization_id.length <= 1){
      await User.remove({_id: userId});
      await Organizationright.remove({user_id: userId});
    } else {
      await User.update({_id: userId}, {$pull: {organization_id: organizationId, organization_admin: organizationId}});
      await Organizationright.remove({user_id: userId, organization_id: organizationId});
      if(user.default_organization.toString() === organizationId.toString()) {
        user.default_organization = user.organization_id.filter(oid => oid.toString() !== organizationId.toString())[0];
        await user.save();
      }
    }
    return res.json({ok: 'ok'})
  }
  else return res.status(404).json({error: 'User not found'})
  
}

module.exports = { getApiKeys, generateApiKey, revokeApiKey, postPut, get, ping, deleteUser }
