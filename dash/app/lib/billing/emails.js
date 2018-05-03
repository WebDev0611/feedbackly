const fs = require("fs");
const _ = require("lodash");
const helper = require("sendgrid").mail;

const Billing = require("./index");
const stripeApi = require("./stripe-api");
const chargeTemplate = fs.readFileSync(__dirname + "/templates/charge.html", { encoding: "utf-8" });
const Organization = require("../../models/organization");
const User = require("../../models/user");

async function sendEmail(params) {
  const { address, message, subject, displayname } = params;

  var mail = new helper.Mail();
  var email = new helper.Email("noreply@feedbackly.com", displayname);
  mail.setFrom(email);
  mail.setSubject(subject);
  var content = new helper.Content("text/html", message);
  mail.addContent(content);
  var personalization = new helper.Personalization();
  personalization.addTo(new helper.Email(address));
  mail.addPersonalization(personalization);

  var sg = require("sendgrid")(process.env.SENDGRID_API_KEY);
  var request = sg.emptyRequest({
    method: "POST",
    path: "/v3/mail/send",
    body: mail.toJSON()
  });

  return new Promise((resolve, reject) => {
    sg.API(request, function(error, response) {
      if (error) {
        console.log("Error response received");
        reject(error);
      } else resolve(200);
      console.log(response.statusCode);
      console.log(response.body);
      console.log(response.headers);
    });
  });
}

async function sendChargeSucceeded(payload) {
  try {
    const charge = _.get(payload, "data.object");
    let invoices = [];
    if (charge.invoice != null) {
      const invoice = await stripeApi.getInvoice(charge.invoice);
      invoices.push(invoice);
    }
    const chargeInfo = Billing.mapCharges(charge, invoices);
    const htmlLines = chargeInfo.lines.map(
      line => `<tr><td>${line.description}</td><td>${Math.round((line.amount || 0)*100)/100} &euro;</td>
            <td>${chargeInfo.tax_percent || 0} %</td><td>${Math.round((line.total || 0)*100)/100} &euro;</td></tr>`
    );
    let html = chargeTemplate.replace("{{htmlLines}}", htmlLines);
    _.forEach(chargeInfo, (val, key) => {
      html = html.replace(`{{${key}}}`, val);
    });

    if(chargeInfo.discount){
      html = html.replace(`{{discount_cond}}`, `Discount: ${chargeInfo.discount} €`);
    } else html=html.replace(`{{discount_cond}}`, '')

    if(chargeInfo.starting_balance !== 0){
      html = html.replace(`{{discount_cond_2}}`, `Discount: ${chargeInfo.starting_balance} €`);
    } else html=html.replace(`{{discount_cond_2}}`, '')


    const organization = await Organization.findOne({ stripe_customer_id: charge.customer });
    html = html.replace("{{name}}", organization.name);
    html = html.replace(
      "{{address}}",
      (_.get(organization, "billingInfo.address") || "").split("\n").join("<br />")
    );
    html = html.replace("{{country}}", _.get(organization, "billingInfo.country") || "");
    html = html.replace("{{taxId}}", _.get(organization, "billingInfo.vatId") || "");

    let billingEmail = _.get(organization, "billingInfo.email");
    if(!billingEmail) {
      const stripeDetails = await stripeApi.getCustomerDetails(organization.stripe_customer_id);
      if(stripeDetails.email && stripeDetails.email > 0) {
        billingEmail = stripeDetails.email;
      } else {
        const user = await User.findOne({organization_admin: organization._id});
        if(user) billingEmail = user.email;
      }
    }

    return sendEmail({
      address: billingEmail,
      displayname: billingEmail,
      message: html,
      subject: "Feedbackly payment receipt"
    });
  } catch (e) {
    console.log(e);
  }
}

async function sendChargeFailed(payload) {}

async function sendChargeRefunded(payload) {}

async function sendPlanChanged(payload) {}

module.exports = {
  sendChargeFailed,
  sendChargeRefunded,
  sendChargeSucceeded,
  sendPlanChanged
};
