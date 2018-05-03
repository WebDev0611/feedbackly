var Promise = require("bluebird");
var moment = require("moment");
var _ = require("lodash");

var stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

var auth = require("../lib/auth");
var paymentConstants = require("../lib/constants/payment-plan");

var Organization = require("../models/organization");
var User = require("../models/user");

const emails = require("../lib/billing/emails");

var eventHandlers = {
  "charge.succeeded": async (req, res, next) => {
    await emails.sendChargeSucceeded(req.body);
    res.sendStatus(200);
  },
  /*
  "charge.failed": async (req, res, next) => {
    await emails.sendChargeFailed(req.body);
    res.sendStatus(200);
  },
  "charge.refunded": async (req, res, next) => {
    await emails.sendChargeRefunded(req.body);
    res.sendStatus(200);
  },
  "customer.subscription.created": async (req, res, next) => {
    await emails.sendPlanChanged(req.body);
    res.sendStatus(200);
  },
  "customer.subscription.updated": async (req, res, next) => {
    await emails.sendPlanChanged(req.body);
    res.sendStatus(200);
  }
  */
};

module.exports = app => {
  app.post("/api/stripe-hooks/:apiKey", auth.hasValidApiKey(req => req.params.apiKey), (req, res, next) => {
    console.log(req.body.data);
    console.log(req.body.type);

    var eventType = req.body.type;

    if (eventType && typeof eventHandlers[eventType] === "function") {
      try {
        eventHandlers[eventType](req, res, next);
      } catch (e) {
        res.sendStatus(500);
      }
    } else {
      res.sendStatus(200);
    }
  });
};
