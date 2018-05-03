var deviceTree = require("../devicetree");
var segmentConstants = require("../constants/organization").segment;
var OrganizationRight = require("../../models/organization/organization-right");
var Organization = require("../../models/organization");
var Devicegroup = require("../../models/devicegroup");
var Device = require("../../models/device");
var Survey = require("../../models/survey");
var User = require("../../models/user");
var Promise = require("bluebird");
var _ = require("lodash");
var cache = require("../cache");

const PLAN_SETTINGS = require("../billing/plan-settings");
const billing = require("../billing");

function toJSON(obj) {
  return JSON.parse(JSON.stringify(obj));
}

async function getOrganizationRights(user, organizationId) {
  const rights = await OrganizationRight.findOne({
    user_id: user._id,
    organization_id: organizationId
  });
  return _.get(rights.toObject(), "rights") || { devicegroups: [] };
}

function getDevices(devices) {
  return Device.findWithMeta({ _id: { $in: devices } }, true);
}

function getDevicegroups(organization_admin, organization_id, devicegroupIds) {
  const query = organization_admin ? { organization_id: organization_id } : { _id: { $in: devicegroupIds } };

  return Devicegroup.find(query);
}

function devicesFromGroups(groups) {
  var devices = _.map(groups, "devices");
  return _.uniq(_.flatten(devices));
}

async function resolveRightsFromOrganization(organization, getOnlyPlanDefaults = false) {
  let rights = await organization.getFeatures(getOnlyPlanDefaults);
  return {
    ...rights,
    user_groups: (_.get(organization, "user_groups") || []).length > 0 ? organization.user_groups : undefined,
    organizationProfanityFilter: organization.profanityFilter
  };
}

function getSurveyNames(devices) {
  var ids = _.map(devices, "active_survey");
  return Survey.find({ _id: { $in: ids } }).select({ _id: 1, name: 1 });
}

function getCacheKey(userId, organizationId) {
  var cacheKey = `user-rights-${userId}-${organizationId}`;
  return cacheKey;
}

async function cacheBust(user) {
  var organization_id = user.activeOrganizationId();
  const users = await User.find({ organization_id }).select({ _id: 1 });
  const ids = _.map(users, "_id");

  var promises = [];
  ids.forEach(id => {
    var cacheKey = getCacheKey(id, organization_id);
    var p = cache.del(cacheKey);
    promises.push(p);
  });

  return Promise.all(promises);
}

function prepareDevicesForTree(devices) {
  var data = {};
  devices.forEach(device => {
    data[device._id] = {
      type: device.type,
      name: device.name,
      udid: device.udid,
      active_survey: device.active_survey
    };
  });
  return data;
}

async function getEverything(user, noCache = false, fields) {
  try {
    const organization_id = user.activeOrganizationId();
    const cacheKey = getCacheKey(user._id, organization_id);

    const cacheRights = await cache.get(cacheKey);
    if (cacheRights && !noCache) return cacheRights;

    const [organization, organizationRights] = await Promise.all([
      Organization.findOne({ _id: organization_id }),
      getOrganizationRights(user, organization_id)
    ]);
  
    let rightsList = {
      organization_id,
      system_admin: user.system_admin,
      organization_admin: user.organization_admin.indexOf(organization_id) > -1,
      locale: _.get(user, "settings.locale"),
      email: _.get(user, "email")
    };
    
    const rightsFromOrg = await resolveRightsFromOrganization(organization);

    rightsList = {
      segment: organization.segment,
      ...rightsList,
      ...organizationRights,
      ...rightsFromOrg,
    };

    const devicegroupObjects = await getDevicegroups(
      rightsList.organization_admin,
      organization_id,
      rightsList.devicegroups
    );
    const devices = devicesFromGroups(devicegroupObjects);

    rightsList = {
      ...rightsList,
      devicegroupObjects,
      devices,
      allChannelsGroup: _.find(devicegroupObjects, { is_all_channels_group: true })
    };

    const deviceObjects = await getDevices(devices);

    rightsList = {
      ...rightsList,
      activeSurveyNames: await getSurveyNames(deviceObjects),
      deviceObjects,
      deviceTree: deviceTree.buildDeviceTree(devicegroupObjects, prepareDevicesForTree(deviceObjects))
    };

    await cache.set(cacheKey, JSON.stringify(rightsList), { ttl: 5 });
    return fields ? _.pick(rightsList, fields.split(",")) : rightsList;
  } catch (e) {
    console.log(e);
    throw e;
  }
}

module.exports = { getEverything, cacheBust, resolveRightsFromOrganization };
