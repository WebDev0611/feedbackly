var logger = require('./logger');
var _ = require('lodash');

function api(res, err, model) {
  if (err) {
		console.log(err);
		res.send(400, "Bad request");
	} else {
		res.send(model);
	}
}

function error(req, res, options) {
  options = _.defaults(options, { code: 500, err: {}, sendAsBody: false });

  logger.logError(req, options.err);

  if(options.sendAsBody === false) {
    res.sendStatus(options.code);
  } else {
    res.status(options.code).json(options.err);
  }
}

function code(req, code) {
  res.send(code);
}

function dbExec(dbreq, res) {
  dbreq.exec(function(err, dbobj) {
      if (err) {
		    console.log('DB ERROR: ', err);
        res.send(400, "Bad request");
      } else {
        res.send(dbobj);
      }
  });
};

module.exports = { api, error, code, dbExec };
