const _ = require("lodash");
const Organization = require("../../models/organization");
const SmsTransaction = require("../../models/sms-transaction");
const oid = require("mongoose").Types.ObjectId;
const billing = require("../../lib/billing");

async function _getBalance(orgId) {
  let balance = await SmsTransaction.aggregate([
    { $match: { organization_id: oid(orgId) } },
    {
      $group: {
        _id: { organization_id: "$organization_id", currency: "$currency" },
        balance: { $sum: "$charge" }
      }
    }
  ]);
  balance = balance.filter(item => item._id.currency === "EUR");
  const returnable = {...balance[0]}
  const org = await Organization.findById(orgId);
  returnable.segment = org.segment
  if(balance[0] === undefined){
    returnable.balance = 0
  }
  return returnable;
}

function createTopUpTransaction(orgId, created_by, charge, currency){
  return SmsTransaction.create({
    organization_id: orgId,
    created_by,
    charge,
    currency: currency,
    details: {
      transactionType: "topup"
    }
  });
}

async function getBalance(req, res) {
  try{
    let orgId = req.user.activeOrganizationId();
    if(req.query.organization_id && req.user.system_admin) orgId = req.query.organization_id
    let balance = await _getBalance(orgId);
    res.send(balance || {});
  } catch(e){
    console.log(e);
    res.status(500).send({error: "Something went wrong"})
  }
}

async function topUp(req, res) {
  try {
    const { charge, currency } = req.body;
    const orgId = oid(req.user.activeOrganizationId());
    const admin = req.user.isOrganizationAdmin();
    if (!admin)
      return res
        .status(401)
        .send({ error: "User is not an organization admin" });

    const stripeResult = await billing.chargeCustomer(orgId, charge * 100, "SMS Top-up");
    const result = await createTopUpTransaction(orgId,req.user._id,charge,currency)
    const balance = await _getBalance(orgId);
    res.send(balance || {});
  } catch (e) {
    console.log(e);
    res
      .status(400)
      .send({ error: _.get(e, "raw.message") || _.get(e, "message") });
  }
}

async function systemAdminTopUp(req, res){
  const {organization_id, charge, currency} = req.body;
  try{
    const result = await createTopUpTransaction(organization_id,req.user._id,charge,currency)
    const balance = await _getBalance(organization_id);
    res.send(balance || {});
  } catch(e){
    console.log(e);
    res.status(500).send({error: e})
  }
}

module.exports = { getBalance, topUp, _getBalance, systemAdminTopUp };
