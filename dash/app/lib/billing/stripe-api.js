const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

function customersRetrieve(id) {
  return stripe.customers.retrieve(id);
}

function updateSubscription(subscription_id, params) {
  return stripe.subscriptions.update(subscription_id, params);
}

function retrieveSubscription(subscription_id) {
  return stripe.subscriptions.retrieve(subscription_id);
}

function cancelSubscription(subscription_id, at_period_end) {
  return stripe.subscriptions.del(subscription_id, {
    at_period_end: at_period_end !== undefined ? at_period_end : true
  });
}

function createSubscription(stripe_id, plan, options, quantity) {
  return stripe.subscriptions.create({
    ...{
      customer: stripe_id,
      items: [
        {
          plan: plan,
          quantity: quantity || 1
        }
      ]
    },
    ...options
  });
}

async function changeSubscriptionPlan(subscription_id, plan) {
  var subscription = await stripe.subscriptions.retrieve(subscription_id);
  var item_id = subscription.items.data[0].id;

  return stripe.subscriptions.update(subscription_id, {
    prorate: true,
    items: [
      {
        id: item_id,
        plan: plan
      }
    ]
  });
}

function createCustomer(orgName, orgId, email) {
  return stripe.customers.create({
    description: orgName,
    email,
    metadata: {
      organizationId: orgId.toString(),
      url: `${process.env.DASH_URL}/v-app/#/admin/organizations/${orgId.toString()}/edit`
    }
  });
}

function createInvoiceItem(stripe_id, amountInCents, description) {
  return stripe.invoiceItems.create({
    customer: stripe_id,
    amount: amountInCents,
    currency: "eur",
    description
  });
}

function chargeCustomer(stripe_id, amount, statement_descriptor, taxPercent) {
  return stripe.charges.create({
    amount: amount * (taxPercent / 100 + 1),
    customer: stripe_id,
    currency: "eur",
    statement_descriptor,
    metadata: { tax_percent: taxPercent }
  });
}

function getCustomerDetails(stripe_id) {
  return stripe.customers.retrieve(stripe_id);
}

function createCard(stripe_id, card_token) {
  return stripe.customers.createSource(stripe_id, { source: card_token });
}

function listCards(stripe_id) {
  return stripe.customers.listCards(stripe_id);
}

function deleteCard(stripe_id, card_id) {
  return stripe.customers.deleteCard(stripe_id, card_id);
}

function getCharges(stripe_id, options) {
  return stripe.charges.list({
    customer: stripe_id,
    ...options
  });
}

function getInvoices(stripe_id, options) {
  return stripe.invoices.list({
    customer: stripe_id,
    ...options
  });
}

function getInvoice(invoiceId) {
  return stripe.invoices.retrieve(invoiceId);
}

module.exports = {
  customersRetrieve,
  cancelSubscription,
  changeSubscriptionPlan,
  retrieveSubscription,
  createSubscription,
  createCustomer,
  updateSubscription,
  createInvoiceItem,
  chargeCustomer,
  getCustomerDetails,
  createCard,
  listCards,
  deleteCard,
  getCharges,
  getInvoices,
  getInvoice
};
