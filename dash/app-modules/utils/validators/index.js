const validateJs = require('validate.js');

validateJs.Promise = require('bluebird');

validateJs.validators.isArray = (value, options, key, attributes) => {
  if(!validateJs.isArray(value)) {
    return 'is not an array';
  }
}

validateJs.validators.timestamp = (value, options, key, attributes) => {
  if(!validateJs.isNumber(value)) {
    return 'is not a timestamp';
  }
}

function validate(object, schema) {
  return validateJs.async(object, schema);
}

module.exports = { validate };
