var errors = require('app-modules/errors');
var request = require('request-promise');

function udidRedirect(getUdid) {
  return (req, res, next) => {
    request(`http://ipad.tapin.fi/check-old-udid/${getUdid(req)}`)
      .then(() => res.redirect(`http://ipad.tapin.fi/ipad/${getUdid(req)}`))
      .catch(() => next());
  }
}

function existsOrError(options) {
  return (req, res, next) => {
    var opts = Object.assign({ getError: () => new errors.NotFoundError(), required: true }, options);

    var promise = options.getPromise(req);

    var decoratedPromise = opts.required === true ? errors.withExistsOrError(opts.getError(req))(promise) : promise;

    decoratedPromise
      .then(value => {
        req[opts.name] = value;

        return next();
      })
      .catch(err => next(err));
  }
}

function existsOrNotActiveError(options) {
  return (req, res, next) => {
    var opts = Object.assign({ getError: () => new errors.SurveyNotActiveError(), required: true }, options);

    var promise = options.getPromise(req);

    var decoratedPromise = opts.required === true ? errors.withExistsOrError(opts.getError(req))(promise) : promise;

    decoratedPromise
      .then(value => {
        req[opts.name] = value;

        return next();
      })
      .catch(err => next(err));
  }
}

module.exports = { existsOrError, udidRedirect, existsOrNotActiveError };
