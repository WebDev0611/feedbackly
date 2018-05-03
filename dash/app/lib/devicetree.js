var Promise = require('bluebird');
var Devicegroup = require('./../models/devicegroup')
var _ = require('lodash');
var Device = require('./../models/device');

function buildDeviceTree(groups, deviceIdToData) {

	var backwards = {};
	var forwards = {};
	var groupIdToData = {};

	groups.forEach(group => {
		groupIdToData[group._id.toString()] = { name: group.name, devices: group.devices, is_all_channels_group: group.is_all_channels_group };
	  backwards[group._id.toString()] = backwards[group._id.toString()] || false;
	  forwards[group._id.toString()] = [];

	  group.devicegroups.forEach(subgroup => {
	    backwards[subgroup.toString()] = true;
	    forwards[group._id.toString()].push(subgroup);
	  });

	});

	var roots = [];

	for(var key in backwards) {
		if(backwards[key] === false) {
	  	roots.push(key);
	  }
	}

	var tree = [];

	roots.forEach(root => {


	  var groupData = groupIdToData[root.toString()];

		groupData.devices = _.filter(groupData.devices, device => {return device !== null })

		var subtree = {
	    _id: root,
	    name: groupData.name,
	    devices: _.chain(groupData.devices).filter(device => deviceIdToData[device.toString()] !== undefined).map(device => {
				var deviceData = deviceIdToData[device.toString()];
				return { _id: device, name: deviceData.name, type: deviceData.type, udid: deviceData.udid, active_survey: deviceData.active_survey };
			}).value(),
			subgroups: [],
			is_all_channels_group: groupData.is_all_channels_group
	  };

	  tree.push(subtree);

	  travel(root, subtree);

	  subtree.devices.sort((a, b) => a.name.localeCompare(b.name));
	  subtree.subgroups.sort((a, b) => a.name.localeCompare(b.name));
	});

	function travel(node, subtree) {
		(forwards[node.toString()] || []).forEach(child => {
	    var groupData = groupIdToData[child.toString()];

			if(groupData === undefined) return;
			groupData.devices = _.filter(groupData.devices, device => {return device !== null })


	    var branch = {
	      _id: child,
	      name: groupData.name,
				type: groupData.type,
	      devices: _.chain(groupData.devices)
					.map(device => {
						var deviceData = deviceIdToData[device.toString()];

						return deviceData !== undefined
							? { _id: device, name: deviceData.name, active_survey: deviceData.active_survey }
							: undefined;
					})
					.filter(device => device !== undefined)
					.value(),
	      subgroups: []
	    };

	    subtree.subgroups.push(branch);

	    travel(child, branch);

	    branch.devices.sort((a, b) => a.name.localeCompare(b.name));
	    branch.subgroups.sort((a, b) => a.name.localeCompare(b.name));
	  });
	}

	return tree;
}

function getDeviceTree(query, organizationId, rights, user) {
	return new Promise((resolve, reject) => {

	var groups = [];
	var deviceIdToData = {};

	var filter = (rights, group) => {
		var hasRights = _.find(rights.devicegroups, id => id.toString() === group._id.toString()) !== undefined;
		var isFullView = user.system_admin === true && organizationId !== undefined;

		return hasRights || isFullView;
	};

			var groupStream = Devicegroup.find(_.assign({ organization_id: organizationId }, query)).stream();

			groupStream.on('data', group => {
				if(filter(rights, group)) {
					groups.push(group);
					group.devices.forEach(device => { deviceIdToData[device.toString()] = undefined })
				}
			});

			groupStream.on('end', () => {

				var deviceStream = Device.find({ _id: { $in: _.keys(deviceIdToData) } }, { name: 1, active_survey: 1, type: 1, udid: 1 }).stream();
				deviceStream.on('data', device => {
					deviceIdToData[device._id] = { name: device.name, type: device.type, udid: device.udid, active_survey: (device.active_survey || '').toString() };

				});

				deviceStream.on('end', () => {
					resolve(buildDeviceTree(groups, deviceIdToData));
				});
			});
	});
}

module.exports = {getDeviceTree, buildDeviceTree}
