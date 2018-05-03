'use strict';

var _ = require('lodash');
var mongoose = require('mongoose');
var moment = require('moment');
var Promise = require('bluebird');

var errors = require('../../../app-modules/errors');

var constants = require('../../lib/constants/organization');
var paymentConstants = require('../../lib/constants/payment-plan');
var cache = require('../../lib/cache');

var Fbevent = require('../fbevent');

const billing = require('../../lib/billing')
const PLAN_SETTINGS = require("../../lib/billing/plan-settings");

var organizationSchema = mongoose.Schema({
  name: { type: String, required: true, minlength: 1 },
	logo: { type: String, required: false },
  privacypolicy: {type: String },
  profanityFilter: {type: String, default: "disabled"},
  stripe_customer_id: { type: String },
  created_at: { type: Date, default: Date.now, required: true },
  customership_state: {
    type: String,
    default: constants.customership.ACTIVE,
    required: true
  },
  custom_settings: {
    enableFeatures: Array,
    disableFeatures: Array,
    responseLimit: Number,
    maxAdminCount: Number,
    maxNonAdminCount: Number,
    maxUserCount: Number,
    canBuyMoreUsers: Boolean
  },
  segment: {
    type: String,
    enum: _.values(constants.segment)
  },
  passcode: String,
  custom_theme:{
    headingFont:String,
    backgroundColor: String,
    headingColor: String,
    textColor : String,
    buttonBGColor : String,
    buttonTextColor : String,
    enabled: Boolean
  },
  pending_ipad_signup: {
    type: Boolean, required: false
  },
  user_groups: [
    { _id: {type: mongoose.Schema.Types.ObjectId, default: mongoose.Types.ObjectId },
      name: String
    }
  ],
  signupMethod: String,
  smsDiscount: {type: Number, min: 0, max: 1},
  billingInfo: {
    email: String,
    vatId: String,
    country: String,
    address: String,
    organizationSize: String,
  }
});

organizationSchema.methods.toJSON = function() {
  var organizationObject = this.toObject();

  organizationObject.has_stripe_customer_id = organizationObject.stripe_customer_id !== undefined;

  delete organizationObject.customership_state;
  delete organizationObject.billing_status;
  delete organizationObject.stripe_customer_id;
  delete organizationObject.channel_subscription_id;

  return organizationObject;
}

organizationSchema.statics.populatableAttributes = function(object) {
  return _.pick(object, ['name', 'logo', 'bgcolor', 'privacypolicy', 'billing_tax_id', 'billing_country','custom_theme', 'user_groups']);
}

organizationSchema.statics.hasFeedback = function(organizationId) {
  var cacheKey = `organization_${organizationId}_has_feedback`;

  return cache.get(cacheKey)
    .then(status => {
      if(status !== undefined) {
        return true;
      } else {
        return Fbevent.findOne({ organization_id: organizationId })
          .then(fbevent => {
            if(fbevent) {
              cache.set(cacheKey, '1');
              return true;
            } else {
              return false;
            }
          });
      }
    });
}

organizationSchema.methods.getTaxPercent = function() {
  if(this.billing_country === undefined) {
    return 0;
  }

  if(paymentConstants.countryTaxPercent[this.billing_country] !== undefined) {
    return paymentConstants.countryTaxPercent[this.billing_country];
  }

  if(paymentConstants.euCountyCodes[this.billing_country] !== undefined && this.billing_tax_id === undefined) {
    return paymentConstants.taxPercents.ALV_PERCENT;
  }

  return 0;
}

organizationSchema.methods.getFeatures = async function (getOnlyPlanDefaults = false) {
  let currentPlanName, rights;
  if (this.segment === "SELF_SIGNUP") {
    const activePlan = await billing.getActivePlans(this._id, this);
    currentPlanName = _.get(activePlan, "currentPlan.name");
  }
  if (this.segment === 'SOLUTION_SALES') {
    rights = PLAN_SETTINGS[PLAN_SETTINGS.constants.SOLUTION_SALES];
  } else {
    rights = PLAN_SETTINGS[currentPlanName || PLAN_SETTINGS.constants.FREE_PLAN]
  }

  if (getOnlyPlanDefaults == false) {
    rights = { ...rights, ...this.custom_settings.toJSON() };
    rights.availableFeatures = _.without(rights.availableFeatures, ...(rights.disableFeatures || []));
    rights.availableFeatures = [...rights.availableFeatures, ...(rights.enableFeatures || [])];
    rights.availableFeatures = _.uniq(rights.availableFeatures);
  }
  delete rights.enableFeatures;
  delete rights.disableFeatures;

  return rights;
}

organizationSchema.methods.hasFeature = async function(featureName){
  const rights = await this.getFeatures();
  return rights.availableFeatures.indexOf(featureName) > -1
}

module.exports = mongoose.model('Organization', organizationSchema);
