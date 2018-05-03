var mongoose = require('mongoose');
var fs = require('fs');
var _ = require('lodash');
var byline = require('byline');
var Promise = require('bluebird');

var Organization = require('../models/organization');
var render = require('./render');

function getUser(getter) {
  return (req, res, next) => {
    var userId = getter(req);

    User.findById(userId)
      .then(user => {
        if(!user) {
          return res.sendStatus(404);
        } else {
          req.targetUser = user;
          next();
        }
      })
      .catch(err => res.sendStatus(500));
  }
}

function getDevice(getter) {
  return (req, res, next) => {
    var deviceId = getter(req);

    Device.findById(deviceId)
      .then(device => {
        if(!device) {
          return res.sendStatus(404);
        } else {
          req.targetDevice = device;
          next();
        }
      })
      .catch(err => res.sendStatus(500));
  }
}

function findById(modelName, getter, options) {
  options = options || {};

  return (req, res, next) => {
    var id = getter(req);

    var executor = mongoose.models[modelName].findById(id);

    if(options.lean === true) {
      executor = executor.lean();
    }

    executor.exec()
      .then(item => {
        if(!item) {
          return res.sendStatus(404);
        } else {
          req[`target${modelName}`] = item;
          next();
        }
      })
      .catch(err => res.sendStatus(500));
  }
}

function getOrganization(getter) {
  return (req, res, next) => {
    var organizationId = getter(req);

    Device.findById(deviceId)
      .then(device => {
        if(!device) {
          return res.sendStatus(404);
        } else {
          req.targetDevice = device;
          next();
        }
      })
      .catch(err => res.sendStatus(500));
  }
}

function lineReader(decorator) {
  if(decorator.filePath === undefined) {
    return decorator.onInValidFile();
  }

  var readStream = byline(fs.createReadStream(decorator.filePath, { encoding: 'utf8' }));

  readStream.on('data', function(chunk) {
    decorator.onData(chunk, readStream);
  });

  readStream.on('end', function() {
    decorator.onEnd();
  });

  readStream.on('error', function(err) {
    decorator.onError();
  });
}

function lineUploader(options) {
  return (req, res) => {
    lineReader({
      filePath: _.get(req, 'files.file.path'),
      onInValidFile: () => res.sendStatus(400),
      onData: (chunk) => {
        options.onLine(chunk, req);
      },
      onEnd: () => res.sendStatus(200),
      onError: () => res.sendStatus(500)
    });
  }
}

function modelUploader(options) {
  return (req, res) => {
    lineReader({
      filePath: _.get(req, 'files.file.path'),
      onInValidFile: () => res.sendStatus(400),
      onData: (chunk, readStream) => {
      //  console.log(chunk)

        var delimiter = chunk.split(",").length > chunk.split(";").length ? "," : ";"
        var data = chunk.split(delimiter);

        if(data.length === 3) {
          readStream.pause();

          var model = options.modelCreator(req, data);

          if(model) {
            model.save(err => {
              readStream.resume()
            });
          }
        }
      },
      onEnd: () => res.sendStatus(200),
      onError: () => res.sendStatus(500)
    });
  }
}

function paginator(options) {
  return (req, res) => {
    var limit = req.query.limit;
    var skip = req.query.skip;
    var isLean = options.lean === undefined ? false : options.lean;
    var model = options.model;
    var sort = options.sort || { _id: 1 };
    var query;

    if(_.isFunction(options.query)) {
      query = options.query(req);
    } else {
      query = options.query;
    }

    var executor = model.find(query);

    if(isLean) {
      executor = executor.lean();
    }

    return Promise.all([
      executor.skip(parseInt(skip || 0)).limit(parseInt(limit || 50)).exec(),
      model.count(query).exec()
    ])
    .then(data => res.json({ list: data[0], count: data[1] }))
    .catch(err => render.error(req, res, { err }));
  }
}

module.exports = { findById, modelUploader, lineUploader, paginator }
