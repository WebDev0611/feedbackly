const mongoose = require("mongoose");
const oid = mongoose.Types.ObjectId;
const Organization = require("../models/organization");
const User = require("../models/user");
const Device = require("../models/device");
const OrganizationRight = require("../models/organization/organization-right");
const Devicegroup = require("../models/devicegroup");
const channelTree = require("../lib/devicetree");
const Survey = require("../models/survey");
const Feedback = require("../models/feedback");
const _ = require("lodash");
const Billing = require("../lib/billing");
const planSettings = require("../lib/billing/plan-settings");
const addSignInCounts = require("../lib/signins").addSignInCounts;
const resolveRightsFromOrganization = require("../lib/rights/functions").resolveRightsFromOrganization;

const FEATURES = require('../lib/constants/features')

const uploadImage = require('../lib/upload_image');

async function getOrganization(req, res) {
  // USER ROUTE
  try {
    const organization = await Organization.findOne({ _id: req.user.activeOrganizationId() });
    let org = { ...organization.toObject() };
    // get stripe stuff if segment is SELF SIGNUP
    if (organization.segment === "SELF_SIGNUP") {
      if (!organization.stripe_customer_id) {
        const cus = await Billing.createStripeCustomer(organization._id);
        await Billing.createSubscription(organization._id, planSettings.constants.FREE_PLAN, 1);
      } else {
        const billingDetails = await Billing.getActivePlans(organization._id);
        const creditCard =
          _.get(await Billing.getOrganizationDetails(organization._id), "sources.data[0]") || {};
        org = {
          ...org,
          ...{
            billingDetails: {
              ..._.omit(billingDetails, "stripe_id"),
              creditCard: _.pick(creditCard, ["last4", "brand", "exp_month", "exp_year"])
            }
          }
        };
      }
    }
    res.json(org);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "Something went wrong" });
  }
}

async function getById(req, res) {
  // ADMIN ROUTE
  // this fetches organization details along with its users, devices, devicegroups
  try {
    const { id } = req.params;
    const organizationPromise = Organization.findOne({ _id: id });
    const userPromise = User.find({ organization_id: id }).select("-password -system_admin");
    const channelPromise = Device.find({ organization_id: id });
    const rightsPromise = OrganizationRight.find({ organization_id: id }).select("-_id");
    const channelGroupsPromise = Devicegroup.find({ organization_id: id });
    const channelTreePromise = channelTree.getDeviceTree({}, id, {}, req.user);
    const surveyPromise = Survey.find({ organization: id }).select({ name: 1, _id: 1 });

    let [
      organization,
      users,
      channels,
      rights,
      channelGroups,
      orgChannelTree,
      surveyNames
    ] = await Promise.all([
      organizationPromise,
      userPromise,
      channelPromise,
      rightsPromise,
      channelGroupsPromise,
      channelTreePromise,
      surveyPromise
    ]);
    const channelFeedbackCount = await mongoose.connection.db
      .collection("devicefeedbacks")
      .find({ device_id: { $in: channels.map(c => c._id) } }, { device_id: 1, feedback_count: 1, _id: 0 })
      .toArray();

    users = users.map(o => {
      const uu = o.toObject();
      uu.organization_admin = uu.organization_admin.map(id => id.toString());
      uu.organization_admin = uu.organization_admin.indexOf(id) > -1;
      return uu;
    });

    const expandedChannelRights = {};

    rights.forEach(right => {
      let u = _.find(users, { _id: right.user_id });
      if (u) {
        u.rights = right.rights;
        u.rights.devicegroups.forEach(dg => {
          if (expandedChannelRights[dg.toString()]) expandedChannelRights[dg.toString()].push(u.displayname);
          else expandedChannelRights[dg.toString()] = [u.displayname];
          _.set(expandedChannelRights, dg.toString(), [
            ..._.get(expandedChannelRights, dg.toString()),
            u.displayname
          ]);
          (_.get(_.find(orgChannelTree, { _id: dg.toString() }), "devices") || []).forEach(d => {
            expandedChannelRights[d._id.toString()] = [
              ...(expandedChannelRights[d._id] || []),
              u.displayname
            ];
          });
        });
      }
    });

    users = await addSignInCounts(users, id);

    const channelsInJSON = [];
    channels.forEach(channel => {
      const JSONChannel = channel.toObject();
      if (JSONChannel.active_survey)
        JSONChannel.active_survey =
          _.get(_.find(surveyNames, { _id: JSONChannel.active_survey }), "name") || "";
      JSONChannel.feedback_count =
        _.get(_.find(channelFeedbackCount, { device_id: JSONChannel._id }), "feedback_count") || 0;
      JSONChannel.rightsToDevice = _.uniq(expandedChannelRights[JSONChannel._id.toString()]);
      channelsInJSON.push(JSONChannel);
    });

    channelGroups = channelGroups.map(g => g.toObject());
    channelGroups.forEach(cg => {
      cg.rightsToGroup = _.uniq(expandedChannelRights[cg._id.toString()] || []);
    });

    const cus_id = organization.stripe_customer_id;
    let organizationJSON = organization.toJSON();
    organizationJSON.stripe_customer_id = cus_id;

    try {
      let orgRights = await resolveRightsFromOrganization(organization, true);
      organizationJSON = { ...organizationJSON, orgRights };
    } catch (e) {
      console.log(e);
    }

    res.json({
      organization: organizationJSON,
      users,
      channels: channelsInJSON,
      channelGroups,
      channelTree: orgChannelTree
    });
  } catch (e) {
    console.log(e);
    res.json({ error: "Something went wrong" });
  }
}

async function postPut(req, res) {
  // TODO: error handling

  const orgId = req.params.id ? oid(req.params.id) : mongoose.Types.ObjectId();
  // organization user
  let attributes = "name billingInfo user_groups".split(" ")
  const isSystemAdmin = req.user.system_admin;
  // system admin
  if (isSystemAdmin) attributes = "name segment billingInfo custom_settings user_groups profanityFilter".split(" ");
  const organization = _.pick(req.body, attributes);

  const { base64Logo, custom_theme } = req.body;
  if (base64Logo || custom_theme) {
    const org = await Organization.findById(orgId)
    const { availableFeatures } = await org.getFeatures();
    if (availableFeatures.indexOf(FEATURES.ORGANIZATION_LOGO) > -1 && base64Logo) {
      organization.logo = await uploadImage.uploadImage(base64Logo, orgId, 200)
    }
    if (availableFeatures.indexOf(FEATURES.SURVEY_APPEARANCE_CUSTOMIZATION) > -1 && custom_theme) {
      organization.custom_theme = custom_theme;
    }
  }


  const result = await Organization.update({ _id: orgId }, { $set: organization }, { upsert: isSystemAdmin });
  const upsertedId = _.get(result, "upserted[0]._id");

  if (upsertedId)
    Devicegroup.create({
      name: "All channels",
      is_all_channels_group: true,
      organization_id: upsertedId
    }).then();

  res.send({ _id: upsertedId ? upsertedId : orgId });
}

async function saveCreditCardToken(req, res) {
  try {
    const orgid = req.user.activeOrganizationId();
    await Billing.addOrUpdateCard(orgid, req.body.id);
    res.json({ ok: "ok" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Something went wrong. Please contact Feedbackly support." });
  }
}

async function changePlan(req, res) {
  try {
    const orgid = req.user.activeOrganizationId();
    const newPlan = req.body.plan;
    const result = await Billing.changePlan(orgid, newPlan);
    console.log(result);
    res.json({ ok: "ok" });
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .json({ error: "Something went wrong. Please contact Feedbackly support if the problem persists." });
  }
}

async function getOrganizationCharges(req, res) {
  const organizationId =
    req.query.organization_id && req.user.system_admin
      ? req.query.organization_id
      : req.user.activeOrganizationId();
  const [charges, invoices] = await Promise.all([
    Billing.getCharges(organizationId),
    Billing.getInvoices(organizationId)
  ]);

  const returnableCharges = charges.data
    .map(charge => Billing.mapCharges(charge, invoices.data))
    .filter(f => f != undefined);
  res.json({ organizationId, charges: returnableCharges });
}

module.exports = {
  getById,
  postPut,
  getOrganization,
  saveCreditCardToken,
  changePlan,
  getOrganizationCharges
};
