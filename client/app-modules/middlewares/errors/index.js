var path = require('path');

var errors = require('app-modules/errors');

function clientErrorHandler() {
  return (err, req, res, next) => {
    var message = 'Something went wrong. Please contact us, if the problem reoccurs.';
    var status = 500;

    if(err instanceof errors.SurveyNotActiveError){
      message = 'There\'s no active survey in this channel. Please come back later.'
      status = 404;
    } else if(err instanceof errors.NotFoundError) {
      message = 'Couldn\'t find what you were looking for. Please, double-check the address';
      status = 404;
    } else if(err instanceof errors.ForbiddenError) {
      message = 'Sorry, but you aren\'t allowed here.';
      status = 401;
    }

    console.log(err);

    return res.status(status).render(path.resolve('./views/client-error.ejs'), { message });
  }
}

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

    console.log(err);

    res.status(statusCode);

    if(opts.sendMessage === true) {
      res.json({ message, details: err.details || {} });
    } else if(statusCode == 404){
      res.send(404); // necessary for older ipads
    } else {
      res.end();
    }
  }
}

module.exports = { clientErrorHandler, apiErrorHandler };
