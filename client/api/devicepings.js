var Device = require('app-modules/models/device');
var Deviceping = require('app-modules/models/deviceping');
var Organization = require('app-modules/models/organization');
var _ = require('lodash')
var Promise = require('bluebird');
var moment = require('moment')
var restClientObj = require('node-rest-client').Client;

module.exports = app => {

  app.get('/pings', async (req, res) => {

    // ultra secret passcode: täppäri

    if (req.query.pass != 'täppäri' && req.query.pass != 'unad8') {
      return res.sendStatus(404);
    }

    const PINGTIME = 3*60 + 60; // 3 mins + 60 seconds for error

    var startOfPeriod = moment.utc().subtract(24, 'hours').unix()
    var endOfPeriod = moment.utc().unix()

    var startOfPeriodDay = moment.utc(startOfPeriod*1000).startOf('day').unix();
    var endOfPeriodDay = moment.utc(endOfPeriod*1000).startOf('day').unix()

    if(req.query.pass == 'unad8') var query = {_id: '5739da94ac291ee900310eea'}
    else var query = {customership_state: {$in: ['ACTIVE', '0']}, segment: 'SOLUTION_SALES'}

    var orgs = await Organization.find(query).sort({name: 1});
    var devices = await Device.find({organization_id: {$in: _.map(orgs, '_id')}, type: "DEVICE", last_seen: {$exists: true}});
    var devicepings = await Deviceping.find({day_start_in_unix: {$gte: startOfPeriodDay, $lte: endOfPeriodDay}, device_id: {$in: _.map(devices, '_id')}})

    var table = []
      _.forEach(devices, device => {
        var ping = _.filter(devicepings, {device_id: device._id}) || []
        var numbers = _.flatten(_.map(ping, p => _.get(p, 'pings') || []))
        numbers = _.filter(numbers, n => (n >= startOfPeriod && n <= endOfPeriod))

        var timeCursor = startOfPeriod;
        var blocks = [];
        _.forEach(numbers, number => {
          var percentageOfDay = (number-startOfPeriod)/86400*100
          if(blocks.length == 0){
            if(number-startOfPeriod <= PINGTIME) blocks.push({start: 0, startStamp: number, endStamp: number, end: percentageOfDay, width: percentageOfDay})
          } else {
            if(number - blocks[blocks.length-1].endStamp <= PINGTIME){
              blocks[blocks.length-1].endStamp = number
              blocks[blocks.length-1].end = percentageOfDay
              blocks[blocks.length-1].width = percentageOfDay - blocks[blocks.length-1].start
            } else {
              blocks.push({startStamp: number, start: percentageOfDay, endStamp: number, end: percentageOfDay, width: 1})
            }
          }

        })

        var last_seen = _.get(device, 'last_seen');

        var pingObj = {organization: _.get(_.find(orgs, {_id: _.get(device, 'organization_id')}), 'name'),
        name: _.get(device, 'name'),
        pings: numbers,
        udid: _.get(device, 'udid'),
        last_seen,
        online: last_seen && (moment.utc().unix() - moment.utc(last_seen).unix() < 60 * 60),
        last_seen_battery: _.get(device, 'last_seen_battery'),
        last_feedback: _.get(device, 'last_feedback'),
        onlineBlocks: blocks,
        focuses: _.get(device, 'focuses')
        }
        table.push(pingObj);
      })
      res.render('./../views/pings.ejs', {table: table, _:_, moment: moment})
  })


app.get('/pings/problem', function(req, res){
  if (req.query.pass != 'täppäri') return res.sendStatus(401);

    var table = [];

    Promise.all([
      Organization.find({customership_state: {$in: ['ACTIVE', '0']}}),
      Device.find({type: "DEVICE", last_seen: {$lt: moment.utc().subtract(2, 'hours')}}).sort('organization_id').exec()
    ]).spread((orgs, devices) => {
        _.forEach(devices, function(dev){
          var obj = {organization: _.get(_.find(orgs, {_id: _.get(dev, 'organization_id')}), 'name'), name: _.get(dev, 'name'), udid: _.get(dev, 'udid'), last_seen: _.get(dev, 'last_seen'), version: "V4", last_seen_battery: _.get(dev, 'last_seen_battery')}
          table.push(obj);
        });

      var merge = table;
      var sorted = _.sortBy(merge, function(val){
        return -moment(val.last_seen).unix();
      })

      return res.render('./../views/pings_problem.ejs', {table: sorted, _:_, moment: moment})
  });

})
}
