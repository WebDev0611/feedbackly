var _ = require('lodash');

function logMessage(message, logFunction) {
  if(process.env === 'production') {
    logFunction(message);
  }

  console.log(message);
}

function logError(req, err) {
  var path = req.path;
  var user = req.user === undefined
    ? {}
    : { email: req.user.email, _id: req.user._id, organizationId: req.user.activeOrganizationId() };

  logMessage({ path, err, date: new Date(), user }, console.log);
}

module.exports = { logError }
