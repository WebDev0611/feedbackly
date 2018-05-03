var errors = require('app-modules/errors');

function existsOrError(options) {
  return (req, res, next) => {
    var opts = Object.assign({ getError: () => new errors.NotFoundError() }, options);

    var promise = options.getPromise(req);

    errors.withExistsOrError(opts.getError(req))(promise)
      .then(value => {
        req[opts.name] = value;

        return next();
      })
      .catch(err => next(err));
  }
}

module.exports = { existsOrError, udidRedirect };
