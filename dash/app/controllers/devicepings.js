'use strict';

var auth = require('../lib/auth'),
    moment = require('moment'),
    Device = require('../models/device'),
    Deviceping = require('../models/deviceping'),
    Organization = require('../models/organization'),
	_ = require('lodash');



module.exports = function (app) {

    app.get('/admin/devicepings', auth.isLoggedInAndAdmin(), function(req, res){
        var day = req.query.day || moment.utc().startOf('day').unix()
        Deviceping.find({day_start_in_unix: day}, function(err, pings){
        Organization.find({$or: [{customership_state: "0"}, {customership_state: {$exists: false}}]}, function(err, orgs){
            var orgids = _.map(orgs, '_id')
            var deviceQuery = Device.find({organization_id: {$in: orgids}}).select('name organization_id udid _id').sort('organization_id');
            deviceQuery.exec(function(err2, devices){
                    var resultPings = [];

                    _.forEach(devices, function(d){
                            var newPing = {pings: [], device: d, org: _.find(orgs, {_id: d.organization_id})}

                            var ping = _.find(pings, {device_id: d._id})
                            if(ping){
                                _.forEach(ping.pings, function(ts){
                                newPing.pings.push([ts, 1]);
                            })
                            }
                        resultPings.push(newPing);

                    })
                    res.send(resultPings)
                })

            });
        })

    })


};
