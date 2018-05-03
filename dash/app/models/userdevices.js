'use strict';

var _ = require('lodash');
var Devicegroup = require('../models/devicegroup');
var Device = require('../models/device');
var mongoose = require('mongoose');

var Userdevices = function(){

	var self = this;

	this.getUserDevices =  function(user, cb){
		var devices = [];
		Devicegroup.find({organization_id: user.organization_id}, function(req, allDevicegroupsInOrg) {
			_.forEach(user.rights.devicegroups, function (dg_id) {
				var dg = _.find(allDevicegroupsInOrg, {_id: mongoose.Types.ObjectId(dg_id)});
				if (dg){
					devices.push(_.flatten(self.getDevicesFromDevicegroup(allDevicegroupsInOrg, dg)));
				}
			});

			cb(_.flatten(devices));
		});
	};

	this.getDevicesFromDevicegroup = function(allGroups, dg){
		if (!allGroups || !dg){
			return [];
		}
		var devices = [];
		_.forEach(dg.devices, function(device){
			devices.push(device);
		});
		if (dg.devicegroups.length > 0){
			_.forEach(dg.devicegroups, function(devicegroup){
				var group = _.find(allGroups, {_id: devicegroup});
				if (group){
					devices.push(self.getDevicesFromDevicegroup(allGroups, group));
				}
				devices = _.flatten(devices, true);
			});
		}
        devices = _.uniq(devices);
        var ret = [];
        _.forEach(devices, function(id){ ret.push(id.toString())});
        return ret;
    };

	this.getDevicegroupAndSiblings = function(allGroups, dgId){
		if (!allGroups || !dgId){
			return [];
		}
		var dgObject = _.find(allGroups, {_id: mongoose.Types.ObjectId(dgId) });
		var dgs = [dgObject];

		_.forEach(dgObject.devicegroups, function(childgroup){
			dgs.push(self.getDevicegroupAndSiblings(allGroups, childgroup));
		});
		return dgs;
	};

	this.getSortedUserDevices = function(user, cb){
		self.getUserDevices(user, function(devices){
			Device.find({_id: {$in: devices}}).sort({name: 1}).exec(function(err, devices){
				cb(_.pluck(devices, "_id"))
			})
		})
	}

	return this;
};

module.exports = new Userdevices();
