var errors = require('app-modules/errors');

var isDevelopment = process.env.DOCKER_ENV !== 'production';

function apiErrorHandler(options) {
  var opts = Object.assign({ sendMessage: true }, options || {});

  return (err, req, res, next) => {
    var statusCode = 500;

    var message = err instanceof errors.ApiError
      ? err.message
      : 'Something went wrong';

    if(err instanceof errors.NotFoundError) {
      statusCode = 404;
    } else if(err instanceof errors.InvalidRequestError) {
      statusCode = 400;
    } else if(err instanceof errors.ForbiddenError) {
      statusCode = 401;
    }

    if(isDevelopment) {
      console.log(err);
    }

    res.status(statusCode);

    if(opts.sendMessage === true) {
      res.json({ message, details: err.details || {} });
    } else {
      res.end();
    }
  }
}

module.exports = { apiErrorHandler };
