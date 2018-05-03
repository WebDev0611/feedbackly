const mongoose = require("mongoose");
const Organization = require("../models/organization");

async function getOrganization(req, res) {
  // USER ROUTE
  try {
    const organization = await Organization.findOne({ _id: req.user.activeOrganizationId() });
    // let org = {}
    let org = {
      display: false,
      referrals: 0,
      paidReferrals: 0,
      lastReferral: {}
    };
    // get stripe stuff if segment is SELF SIGNUP
    if (organization.segment === "SELF_SIGNUP") {
      org.display = true;
      // if (!organization.stripe_customer_id) {
      //   const cus = await Billing.createStripeCustomer(organization._id);
      //   await Billing.createSubscription(organization._id, planSettings.constants.FREE_PLAN, 1);
      // } else {
      //   const billingDetails = await Billing.getActivePlans(organization._id);
      //   const creditCard =
      //     _.get(await Billing.getOrganizationDetails(organization._id), "sources.data[0]") || {};
      //   org = {
      //     ...org,
      //     ...{
      //       billingDetails: {
      //         ..._.omit(billingDetails, "stripe_id"),
      //         creditCard: _.pick(creditCard, ["last4", "brand", "exp_month", "exp_year"])
      //       }
      //     }
      //   };
      // }
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
    
    let [
      organization
    ] = await Promise.all([
      organizationPromise
    ]);
    const channelFeedbackCount = await mongoose.connection.db
    .collection("devicefeedbacks")
    .find({ device_id: { $in: channels.map(c => c._id) } }, { device_id: 1, feedback_count: 1, _id: 0 })
    .toArray();
    
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
    });
  } catch (e) {
    console.log(e);
    res.json({ error: "Something went wrong" });
  }
}

module.exports = {
  getById,
  getOrganization
};
