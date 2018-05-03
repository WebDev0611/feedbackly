var general = require('app-modules/middlewares/general');

var Device = require('app-modules/models/device');

function getChannel(queryGetter) {
  return general.existsOrError({
    getPromise: req => Device.findOne(queryGetter(req)),
    name: 'channel'
  });
}

function getChannelById(getId) {
  return getChannel(req => ({ _id: getId(req) }));
}

module.exports = { getChannelById, getChannel };
