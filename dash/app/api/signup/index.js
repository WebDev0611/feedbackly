const Organization = require("../../models/organization");
const OrganizationRight = require("../../models/organization/organization-right");
const jwt = require("jsonwebtoken");

const User = require("../../models/user");
const Channelgroup = require("../../models/devicegroup");
const segmentConstants = require("../../lib/constants/organization").segment;
const planConstants = require("../../lib/billing/plan-settings");
const Billing = require("../../lib/billing");
var intercom = require('../../lib/intercom');

async function post(req, res) {
  try {
    const { password, initialToken } = req.body;
    const decodedJWT = jwt.verify(initialToken, process.env.JWT_SECRET);

    const displayName = decodedJWT.name;
    const orgName = decodedJWT.organization;
    let { email } = decodedJWT;

    email = email.toLowerCase()

    const oldUser = await User.findOne({ email });
    if (oldUser)
      return res
        .status(400)
        .json({ error: "User already exists. Please log in or request a new password in the login screen." })

        [(displayName, orgName, email)].forEach(n => {
          if (!n || n.length < 4)
            return res.status(400).json({ error: "Invalid request. Check input fields." });
        });

    const organization = await Organization.create({
      name: orgName,
      segment: segmentConstants.SELF_SIGNUP,
      billingInfo: req.body.billingInfo
    });

    if (!organization._id) return res.status(500).json({ error: "Something went wrong." });

    const promises = [
      User.create({
        email,
        password,
        displayname: displayName,
        organization_id: [organization._id],
        organization_admin: [organization._id],
        default_organization: organization._id
      }),
      Channelgroup.create({
        organization_id: organization._id,
        name: "All channels",
        is_all_channels_group: true
      }),
      Billing.createStripeCustomer(organization._id)
    ];

    
    const [user, channelgroup] = await Promise.all(promises);
    if (req.body.token) {
      // has credit details
      await Billing.addOrUpdateCard(organization._id, req.body.token.id)
    }

    const subscriptionName = req.body.token ? req.body.plan : planConstants.constants.FREE_PLAN;

    await Promise.all([
      OrganizationRight.create({
        organization_id: organization._id,
        user_id: user._id,
        rights: { devicegroups: [channelgroup._id], survey_create: true}
      }),
      Billing.createSubscription(organization._id, subscriptionName)
    ]);


    var ICParams = {
      organization: orgName,
      segment: 'SELF_SIGNUP'
    }

    intercom.createUser(user, ICParams)

    return res.json({ ok: "ok", user_id: user._id });
  } catch (e) {
    if (e) console.log(e);
    return res.status(500).json({
      error: "Something went wrong. Please check your input and contact Feedbackly if the problem persists."
    });
  }
}

module.exports = { post };
