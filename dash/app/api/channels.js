const Devicegroup = require('../models/devicegroup');
const Device = require('../models/device');
const Survey = require('../models/survey');
const _ = require('lodash');
const oid = require('mongoose').Types.ObjectId;

const FEATURES = require('../lib/constants/features')

function getDefaultPluginSettings(){
  return {
    "urlPatterns" : {
        "rules" : [], 
        "mode" : "single"
    }, 
    "exitTrigger" : false, 
    "afterPercentage" : 0, 
    "hiddenAfterFeedbackForHours" : 24, 
    "hiddenAfterClosedForHours" : 24, 
    "showAfterVisitedPages" : 0 ,
    "showAfterSecondsOnSite" : 0, 
    "showAfterSecondsOnPage" :0, 
    "display" : "popup", 
    "placement" : "bottom-right", 
    "sampleRatio" : 1
  }
}

async function post(req, res){

  try{
    if (!req.userRights.availableFeatures.indexOf(FEATURES.CHANNEL_CREATION) === -1) return res.sendStatus(401);
    var sysadmin = req.user.system_admin;

    var body = req.body;
    var organization_id = req.body.organization_id && sysadmin
      ? req.body.organization_id
      : req.userRights.organization_id;
    var channel;


    const survey = await Survey.findOne({ organization: organization_id, generated: true });

    const payload = {
      name: body.name,
      type: body.type,
      passcode: Device.generatePasscode(),
      active_survey: _.get(survey, '_id'),
      latest_activation: Math.round(Date.now() / 1000),
      organization_id,
      settings: body.settings ||  (body.type === 'PLUGIN' ? {pluginSettings: getDefaultPluginSettings()}: {}),
      upsells: body.upsells
    }

    if (body.udid && sysadmin) payload.udid = body.udid;
    const d = await Device.create(payload)
    const id = d._id;
    channel = d;

    var ids = []
    if (body.putInChannelGroups) {
      ids = _.filter(body.putInChannelGroups, id => { req.userRights.devicegroups.indexOf(id) > -1 } )
      if (req.userRights.organization_admin || sysadmin) ids = body.putInChannelGroups;
    }

    await Devicegroup.update(
      {organization_id, $or: [{ is_all_channels_group: true }, { _id: { $in: ids } }]},
      { $push: { devices: id } },
      { multi: true }
    )
    res.send(channel);
  } catch(err){
    console.log(err)
    res.status(500).json({error: err})
  }
}

async function put(req, res){
  try{
  const id = oid(req.params.id);

  // basic rights
  let attributes = "description name settings logo force_default_language".split(" ")

  // sysadmin
  if(req.user.system_admin){
    attributes = "description name type udid settings logo force_default_language mdm_link ip_assignment".split(" ")
  }
  
  const channel = _.pick(req.body, attributes);
  let operation = {}
  if(channel.ip_assignment === "" || channel.ip_assignment == null) {
    delete channel.ip_assignment
    operation.$unset = { ip_assignment : ""}
  }
  operation.$set = channel;

  const result = await Device.update({_id: id}, operation);
  res.send({_id: id});
} catch(e){
  console.log(e)
  if(e.errmsg.indexOf('duplicate')>-1) return res.status(400).send({error: 'Unallowed duplicate values, check ip or udid'})
  res.status(500).send({error: 'Something went wrong'})
}

}

module.exports = {post, put}
