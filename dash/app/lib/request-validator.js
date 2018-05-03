var _ = require('lodash');
var validate = require('validate.js');

function bodyRequirements(requirements) {
  return (req, res, next) => {
    var fullFilled = true;
    var missing = '';
    if(_.isArray(requirements)) {
      requirements.forEach(requirement => {
        if(_.get(req.body, requirement) === undefined) {
          fullFilled = false;
          missing = requirement;

          return;
        }
      });
    } else if(_.isObject(requirements)) {
      for(var key in requirements) {
        var validator = requirements[key];

        if(_.get(req.body, key) === undefined || validator(_.get(req.body, key)) === false) {
          fullFilled = false;
          missing = key;
        }
      }
    }

    if(fullFilled) {
      next();
    } else {
      res.status(400).json({ error: `Invalid '${missing}' attribute in the request body` });
    }

  }
}

function isValid(getter, schema) {
  return (req, res, next) => {
    var data = getter(req);

    var errors = validate(data, schema);

    if(errors === undefined) {
      return next();
    } else {
      return res.status(400).json(errors);
    }
  }
}


module.exports = { bodyRequirements, isValid };
