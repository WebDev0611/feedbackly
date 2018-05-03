const Functions = require("./functions");

function getEverythingMW() {
  return function(req, res, next) {
    if (req.user) {
      Functions.getEverything(req.user).then(rights => {
        req.userRights = rights;
        next();
      });
    } else res.status(401).send({ error: "Must be logged in" });
  };
}

function isAuthenticatedAndOrgAdmin() {
  var jwtAuth = require("../../../config/auth")();

  return function(req, res, next) {
    jwtAuth.authenticate()(req, res, () => {
      if (req.isAuthenticated()) {
        // <--- TODO: check for JWT Bearer token
        Functions.getEverything(req.user).then(rights => {
          req.userRights = rights;
          if (rights.organization_admin) next();
          else res.status(401).send({ error: "Not admin" });
        });
      } else res.status(401).send({ error: "Must be logged in" });
    });
  };
}

module.exports = { getEverythingMW, isAuthenticatedAndOrgAdmin };
