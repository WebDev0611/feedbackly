var moment = require('moment');
var Promise = require('bluebird');

var Device = require('app-modules/models/device');
var Deviceping = require('app-modules/models/deviceping');
var Survey = require('app-modules/models/survey');

var errors = require('app-modules/errors');
var channels = require('app-modules/middlewares/channels');

function createPing(device, battery){
  var unix = moment.utc().unix();

  Deviceping.update({device_id: device._id, day_start_in_unix: moment.utc().startOf('day').unix()},
    {$set: {device_id: device._id}, $push: {pings: unix}}, {upsert: true})
  .then(function(result){
    Device.update({_id: device._id}, {$set: {last_seen: new Date(), last_seen_battery: battery}}).exec();
  })
  .catch(function(err){
    console.error('PING FAIL', device._id, unix);
    console.log(err);
  });
}

module.exports = function(app){

  app.get('/api/ping/:channelId/:latestRefresh',
    channels.getChannelById(req => req.params.channelId),
    (req, res, next) => {
      var latestRefresh = req.params.latestRefresh;
      var channelHasBeenActivated = req.channel.latest_activation > latestRefresh;
      var battery = req.query.battery;
      if(battery) battery = parseInt(battery * 100);
      createPing(req.channel, battery || 'NA');

      var promise = req.channel.active_survey === undefined
        ? Promise.resolve(channelHasBeenActivated)
        : errors.withExistsOrError(new errors.NotFoundError())(Survey.findOne({ _id: req.channel.active_survey }))
            .then(survey => {
              return survey.updated_at > latestRefresh || channelHasBeenActivated;
            });

      promise
        .then(shouldRefresh => {
          return res.json({ refresh: shouldRefresh });
        })
        .catch(err => next(err));
    });
}
