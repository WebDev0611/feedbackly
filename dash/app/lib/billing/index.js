let Organization = require("../../models/organization/index");
const stripeApi = require("./stripe-api");
const planSettings = require("./plan-settings");
const _ = require("lodash");
const Tax = require('./tax')

function planOrderNumber(planName) {
  return planSettings.planOrder.indexOf(planName);
}

// get highest active plan

async function getActivePlans(organization_id, providedOrganization) {
  Organization = require("../../models/organization/index");
  // providedOrganization is optional
  try {
    const organization = providedOrganization || (await Organization.findOne({ _id: organization_id }));
    if (!organization || organization.segment === "SOLUTION_SALES") throw 404;

    const stripe_id = organization.stripe_customer_id;
    if (!stripe_id) throw 404;

    const customer = await stripeApi.customersRetrieve(stripe_id);

    let highestPlan = { name: planSettings.planOrder[0] },
      oldPlan,
      futurePlan;

    const subscriptions = customer.subscriptions.data.map(sub => {
      const isTrialing = sub.status == "trialing";
      const subscriptionIsAPlan = sub.plan.id.indexOf("_PLAN") > -1;
      const downGradeToThis = isTrialing && subscriptionIsAPlan && sub.cancel_at_period_end == false;
      if (subscriptionIsAPlan && planOrderNumber(sub.plan.id) >= planOrderNumber(highestPlan.name))
        highestPlan = { name: sub.plan.id, subscription_id: sub.id };

      const object = {
        subscription_id: sub.id,
        plan: sub.plan.id,
        ends: sub.cancel_at_period_end ? sub.current_period_end : null,
        price: sub.plan.amount / 100,
        currency: sub.plan.currency,
        downGradeToThis
      };
      if (object.ends) oldPlan = { id: sub.plan.id, ends: object.ends, subscription_id: sub.id };
      if (downGradeToThis) futurePlan = { id: sub.plan.id, starts: sub.trial_end, subscription_id: sub.id };
      return object;
    });

    const activePlans = {
      stripe_id,
      subscriptions,
      currentPlan: highestPlan
    };

    if (oldPlan && futurePlan) activePlans.hasDowngraded = { oldPlan, futurePlan };

    if (subscriptions.length == 0) return null;
    return activePlans;
  } catch (e) {
    console.log(e);
  }
}

async function changePlan(organization_id, planToChangeTo) {
  try {
    let result;
    const activePlans = await getActivePlans(organization_id);
    console.log(activePlans);
    if (!activePlans) throw 404;

    if (activePlans.hasDowngraded) {
      if (planOrderNumber(planToChangeTo) >= planOrderNumber(activePlans.hasDowngraded.oldPlan.id)) {
        // reactivates previous plan (and upgrades)
        result = await stripeApi.changeSubscriptionPlan(
          activePlans.hasDowngraded.oldPlan.subscription_id,
          planToChangeTo
        );
        await stripeApi.cancelSubscription(activePlans.hasDowngraded.futurePlan.subscription_id, false);
      } else {
        // change trialing subscription item (still downgrading and already paid higher plan will be in action)
        result = await stripeApi.changeSubscriptionPlan(
          activePlans.hasDowngraded.futurePlan.subscription_id,
          planToChangeTo
        );
      }
    } else {
      result =
        planOrderNumber(planToChangeTo) > planOrderNumber(activePlans.currentPlan.name)
          ? await _upgradePlan(activePlans.currentPlan.subscription_id, planToChangeTo)
          : await _downgradePlan(
              activePlans.currentPlan.subscription_id,
              planToChangeTo,
              activePlans.stripe_id
            );
    }

    return result;
  } catch (e) {
    console.log(e);
    throw "Internal error";
  }
}

function _upgradePlan(subscription_id, planToChangeTo) {
  return stripeApi.changeSubscriptionPlan(subscription_id, planToChangeTo);
}

async function _downgradePlan(subscription_id, planToChangeTo, stripe_id) {
  const subscription = await stripeApi.cancelSubscription(subscription_id);
  const periodEnd = subscription.current_period_end;
  const params = {
    trial_end: periodEnd
  };
  return stripeApi.createSubscription(stripe_id, planToChangeTo, params);
}

async function createStripeCustomer(organization_id) {
  Organization = require("../../models/organization/index");

  const organization = await Organization.findById(organization_id);
  if (!organization || organization.stripe_customer_id)
    throw "Organization doesn´t exist or stripe id already exists";

  const stripeCustomer = await stripeApi.createCustomer(organization.name, organization._id, _.get(organization, 'billingInfo.email'));
  const stripe_id = stripeCustomer.id;

  const result = await Organization.update(
    { _id: organization._id },
    { $set: { stripe_customer_id: stripe_id } }
  );

  return result;
}

async function createSubscription(organization_id, plan, quantity=1) {
  const organization = await Organization.findById(organization_id);
  const stripeId = organization.stripe_customer_id;

  const billingInfo = _.get(organization, 'billingInfo') || {}
  const taxPercent = Tax.getTaxRate(billingInfo.country, billingInfo.vatId, billingInfo.organizationSize)

  const opts = taxPercent ? { tax_percent: taxPercent } : {};
  opts.metadata = {country: billingInfo.country}
  return stripeApi.createSubscription(stripeId, plan, opts, quantity);
}

async function changeUserCount(organization_id, count) {
  const EXTRA_USER = "EXTRA_USER";
  const organization = await Organization.findById(organization_id);
  const stripe_id = organization.stripe_customer_id;
  const stripeCustomer = await stripeApi.customersRetrieve(stripe_id);

  const usersSubscriptionArray = stripeCustomer.subscriptions.data.filter(sub => sub.plan.id == EXTRA_USER);

  if (usersSubscriptionArray.length == 1) {
    const subscription = usersSubscriptionArray[0];
    const item_id = subscription.items.data[0].id;
    return stripeApi.updateSubscription(subscription.id, {
      items: [
        {
          id: item_id,
          plan: EXTRA_USER,
          quantity: count
        }
      ],
      prorate: true
    });
  } else if (usersSubscriptionArray.length == 0) {
    return createSubscription(organization_id, EXTRA_USER, count);
  } else {
    console.log("Error, too many extra user subscriptions");
    throw "Too many extra user subscriptions";
  }
}

/* async function addInvoiceItem(organization_id, item) {
  // item = {amount: 1000, description: 'Amount in cents, this is 10€'}
  const organization = await Organization.findById(organization_id);
  const stripeId = organization.stripe_customer_id;
  return stripeApi.createInvoiceItem(stripeId, item.amount, item.description);
} */

async function chargeCustomer(organization_id, amount, description) {
  const organization = await Organization.findById(organization_id);
  const stripeId = organization.stripe_customer_id;

  const billingInfo = _.get(organization, 'billingInfo') || {}
  const taxPercent = Tax.getTaxRate(billingInfo.country, billingInfo.vatId, billingInfo.organizationSize)

  return stripeApi.chargeCustomer(stripeId, amount, description, taxPercent);
}

async function getCustomerDetails(organization_id) {
  const organization = await Organization.findById(organization_id);
  const stripeId = organization.stripe_customer_id;
  const stripeCustomer = await stripeApi.customersRetrieve(stripeId);
  return stripeCustomer;
}

async function getOrganizationDetails(organization_id) {
  const stripeCustomer = await getCustomerDetails(organization_id);
  return stripeCustomer;
}

async function addOrUpdateCard(organization_id, token) {
  const organization = await Organization.findById(organization_id);
  const stripeId = organization.stripe_customer_id;
  const previousCards = await stripeApi.listCards(stripeId);
  const cardsToDelete = previousCards.data.map(c => c.id);
  const newCard = await stripeApi.createCard(stripeId, token);

  for (id of cardsToDelete) {
    await stripeApi.deleteCard(stripeId, id);
  }
}

async function getCharges(organization_id) {
  const organization = await Organization.findById(organization_id);
  const stripeId = organization.stripe_customer_id;

  const options = { limit: 100 };

  const charges = await stripeApi.getCharges(stripeId, options);

  return charges;
}

async function getInvoices(organization_id) {
  const organization = await Organization.findById(organization_id);
  const stripeId = organization.stripe_customer_id;

  const options = { limit: 100 };

  const invoices = await stripeApi.getInvoices(stripeId, options);
  return invoices;
}

function mapCharges(charge, invoices) {
  if (charge.paid !== true) return;
  const obj = {
    id: charge.id,
    total: charge.amount / 100,
    source: `${_.get(charge, "source.brand")}, *${_.get(charge, "source.last4")}`,
    date: charge.created,
    starting_balance: 0,
  };
  const invoice = _.find(invoices, { id: charge.invoice });

  if (invoice) {
    obj.discount_percent =  _.get(invoice, 'discount.coupon.percent_off')
    if(obj.discount_percent){
      obj.discount = Math.round((obj.total / (1-(obj.discount_percent/100)) - obj.total)*100)/100;
    }

    // paid subscription
    obj.tax = (invoice.tax || 0)/100;
    obj.tax_percent = invoice.tax_percent || 0;

    obj.lines = invoice.lines.data.map(line => {
      if(line.description && line.description.indexOf('@')) line.description = undefined;
      const planName = _.get(line, 'plan.name');
      obj.starting_balance =+ invoice.starting_balance/100;
      return {
        description: line.description || `Subscription ${planName ? 'to ' + planName : ''}`,
        amount: line.amount / line.quantity / 100,
        quantity: line.quantity,
        total: (line.amount / 100)*(1+(obj.tax_percent/100))
      };
    });
    
  } else {
    // another charge eg. SMS top up

    obj.tax_percent = parseInt(_.get(charge, "metadata.tax_percent") || 0);
    obj.tax = obj.total - obj.total / (1 + obj.tax_percent / 100);
    obj.tax = Math.round(obj.tax * 100) / 100;
    obj.lines = [
      {
        description: charge.description || charge.statement_descriptor,
        amount: Math.round(obj.total / (1 + obj.tax_percent / 100) * 100) / 100,
        quantity: 1,
        total: obj.total
      }
    ];
  }
  if(obj.starting_balance != 0 && obj.tax_percent > 0){
    obj.tax = obj.total * (obj.tax_percent/100)
    obj.tax = Math.round(obj.tax*100)/100
  }
  obj.price_without_tax = Math.round((obj.total - obj.tax)*100)/100
  return obj;
}

module.exports = {
  getActivePlans,
  changePlan,
  createStripeCustomer,
  createSubscription,
  changeUserCount,
  chargeCustomer,
  getOrganizationDetails,
  addOrUpdateCard,
  getCharges,
  getInvoices,
  mapCharges
};
