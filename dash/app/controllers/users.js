"use strict";

var passport = require("passport");
var jwt = require("jsonwebtoken");
var _ = require("lodash");
var moment = require("moment");
var jwt = require("jsonwebtoken");
var Promise = require("bluebird");
var mongoose = require("mongoose");

var User = require("../models/user");
var Device = require("../models/device");
var Organization = require("../models/organization");
var OrganizationRight = require("../models/organization/organization-right");

var auth = require("../lib/auth");
var middlewares = require("../lib/middlewares");
var render = require("../lib/render");
var mailer = require("../lib/mailer");
var validator = require("../lib/request-validator");
var intercom = require("../lib/intercom");

var deviceTypes = require("../lib/constants/device").deviceTypes;

var login = require("../lib/login");
var render = require("../lib/render");
var rights = require("../lib/rights");
const addSignInCounts = require("../lib/signins").addSignInCounts;

function updateUserLoginCount(user) {
  mongoose.connection.db
    .collection("usersignins")
    .insertOne({
      user_id: user._id,
      organization_id: user.organization_id,
      sign_in: new Date()
    })
    .then();
}

module.exports = function(app) {
  app.post("/api/users/login", login.handle(), (req, res) => {
    if (req.loggedInUser.loggedInFromAdmin) return res.json(req.loggedInUser);
    updateUserLoginCount(req.loggedInUser);
    console.log(`User ${req.loggedInUser.email} logged in.`)
    res.json(req.loggedInUser);
  });

  app.get("/logout", (req, res) => {
    req.logout();
    res.clearCookie("jwt");
    res.redirect("/v-app/#/login");
  });

  app.post("/api/users/logout", (req, res) => {
    req.session.destroy();
    req.logout();
    res.sendStatus(200);
  });

  app.post(
    "/api/users/:id/switch_organization",
    auth.isLoggedIn(),
    auth.isCurrentUser(req => req.params.id),
    validator.bodyRequirements(["organizationId"]),
    auth.isInOrganization(req => req.body.organizationId),
    login.handle(req => req.body.organizationId),
    (req, res) => {
      console.log(`User ${req.loggedInUser.email} switched their organization to ${req.body.organizationId}`)
      updateUserLoginCount(req.loggedInUser);
      res.json(req.loggedInUser);
    }
  );

  app.post(
    "/api/users/:id/finish_tutorial",
    auth.isLoggedIn(),
    auth.isCurrentUser(req => req.params.id),
    intercom.eventMiddleware({ eventName: "tutorial_finished" }),
    (req, res) => {
      var tutorialId = req.body.id;
      User.update({ _id: req.params.id }, { $push: { tutorials_finished: tutorialId } }).then(() => {
        res.sendStatus(200);
      });
    }
  );

  app.get(
    "/api/user/:id/organizations",
    auth.isLoggedIn(),
    auth.isCurrentUser(req => req.params.id),
    middlewares.findById("User", req => req.params.id),
    (req, res) => {
      Organization.find({ _id: { $in: req.targetUser.organization_id || [] } })
        .then(organizations => res.json(organizations))
        .catch(err => render.error(req, res, { err }));
    }
  );

  app.get(
    "/api/users/:id/device_rights",
    auth.isLoggedIn(),
    auth.isCurrentUser(req => req.params.id),
    (req, res) => {
      req.user.devices().then(devices => {
        return res.json(devices);
      });
    }
  );

  app.get(
    "/api/users/:id",
    auth.isLoggedIn(),
    middlewares.findById("User", req => req.params.id),
    auth.isUserOrIsOrganizationAdmin(req => req.targetUser),
    (req, res) => {
      var organizationScope = req.query.organization_scope
        ? req.query.organization_scope
        : req.user.activeOrganizationId();

      req.targetUser
        .rightsInOrganization(organizationScope)
        .then(async rights => {
          return Object.assign({}, req.targetUser.toJSON(), { rights });
        })
        .then(user => {
          user.organization_admin = user.organization_admin.map(s => s.toString()).indexOf(organizationScope.toString()) > -1;
          return user
        })
        .then(user => {
          return addSignInCounts([user], organizationScope);
        })
        .then(user => {
          res.json(user[0]);
        })
        .catch(err => render.error(req, res, { err }));
    }
  );

  app.post("/api/user/send_password_reset_link", function(req, res) {
    const email = (req.body.email || '').toLowerCase()
    console.log(`${email} requested send reset link`);
    User.findOne({ email }, function(err, user) {
      if (err || !user) {
        console.log("No account found with the given email address");
        res.json({ ok: "ok" });
      } else {
        user
          .sendPasswordReset()
          .then(() => res.json({ ok: "ok" }))
          .catch(err => render.error(req, res, { err }));
      }
    });
  });

  app.post("/api/ipad-login", login.handle(), (req, res) => {
    User.findById(req.loggedInUser._id)
      .then(user => user.devices({ type: "DEVICE" }))
      .then(devices => {
        console.log(devices);
        var results = _.map(devices, d => {
          return { name: d.name, udid: d.udid, passcode: d.passcode };
        });
        res.send({ name: req.loggedInUser.displayname, results: results });
      })
      .catch(err => res.send(err));
  });

  app.post(
    "/api/user/change_password",
    auth.hasValidToken(req => req.body.token, { name: "token", for: "passwordReset" }),
    function(req, res) {
      User.findById(req.token.userId)
        .then(user => {
          if (!user) {
            return res.sendStatus(404);
          } else {
            console.log(`${user.email} changed their password`)
            user.password = User.generateHash(req.body.password);

            user
              .save()
              .then(() => res.json({ success: "ok" }))
              .catch(() =>
                res.status(500).json({ error: "Something went wrong. Please contact Feedbackly support." })
              );
          }
        })
        .catch(err => render.error(req, res, { err }));
    }
  );

  app.get("/api/user-rights", auth.isLoggedIn(), (req, res) => {
    rights
      .getEverything(req.user, req.query.bust, req.query.fields)
      .then(rights => {
        res.json(rights);
      })
      .catch(err => res.send(err));
  });

  app.post(
    "/api/user/verify_email_token",
    auth.hasValidToken(req => req.body.token, {
      name: "token",
      for: "passwordReset"
    }),
    (req, res) => {
      res.sendStatus(200);
    }
  );
};
