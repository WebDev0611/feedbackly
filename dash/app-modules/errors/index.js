const Promise = require('bluebird');

function ApiError(message, details) {
  this.name = 'ApiError';
  this.message = message || 'Something went wrong';
  this.details = details || {};
  this.stack = (new Error()).stack;
}

ApiError.prototype = Object.create(Error.prototype);

function NotFoundError(message, details) {
  ApiError.call(this, message || 'Not found', details || {});

  this.name = 'NotFoundError';
}

NotFoundError.prototype = Object.create(ApiError.prototype);

function InvalidRequestError(message, details) {
  ApiError.call(this, message || 'Invalid request', details || {});

  this.name = 'InvalidRequestError';
}

InvalidRequestError.prototype = Object.create(ApiError.prototype);

function ForbiddenError(message, details) {
  ApiError.call(this, message || 'Forbidden', details || {});

  this.name = 'ForbiddenError';
}

ForbiddenError.prototype = Object.create(ApiError.prototype);

function withExistsOrError(error) {
  return promise => {
    return promise
      .then(value => {
        if(value === null || value === undefined) {
          return Promise.reject(error);
        } else {
          return value;
        }
      });
  }
}

module.exports = { ApiError, NotFoundError, InvalidRequestError, ForbiddenError, withExistsOrError }
