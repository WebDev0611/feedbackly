var validators = require('app-modules/utils/validators');
var errors = require('app-modules/errors');

function validate(getObject, schema) {
  schema = schema || {};

  return (req, res, next) => {
    var object = getObject(req);

    validators.validate(object, schema)
      .then(
        () => {
          return next();
        },
        error => {
          console.log(error);
          return next(new errors.InvalidRequestError('Invalid request', error));
        }
      );
  }
}

function validateBody(schema) {
  return validate(req => req.body, schema);
}

function validateQuery(schema) {
  return validate(req => req.query, schema);
}

module.exports = { validate, validateBody, validateQuery }
