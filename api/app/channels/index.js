/**
 * @api {get} /channels/:id GET CHANNEL BY ID
 * @apiName GetChannelById
 * @apiGroup Channel
 * @apiVersion 1.0.0
 * @apiDescription Gets the information about a feedback channel by its id.
 *
 * @apiParam {String} id Channel's unique ID.
 *
 * @apiSuccess {String} id object's unique ID
 * @apiSuccess {String} name Name of the feedback channel
 * @apiSuccess {String} type Type of the feedback channel
 * @apiSuccess {String} active_survey The id of the currently active survey in the channel
 * @apiSuccess {String} organizatioN_id Organization id
 * @apiSuccess {Date} last_feedback The date of the latest feedback in the channel in ISOString format
 * @apiSuccess {Date} [last_seen] (For Kiosks) The date when last contact was received from the kiosk app
 * @apiSuccess {Integer} [last_seen_battery] (For Kiosks) The level of battery the kiosk had when it was last seen (0-100)

 */

const _ = require('lodash');
const OUTPUT_FIELDS = {_id: 0, id: "$_id", name: 1, type: 1, active_survey: 1, organization_id: 1, last_feedback: 1, last_seen: 1, last_seen_battery : 1}
const mongoose = require('mongoose')
const oid = mongoose.Types.ObjectId;

async function getById(req, res){
  try{
  const device_ids = _.get(req, 'rights.device_ids');
  let id;
  try{ id = oid(req.params.id) } catch(e){ console.log(e); return res.status(400).json({error: 'Invalid channel id'}) }
  if(device_ids.map(id => id.toString()).indexOf(id.toString()) == -1) return res.status(404).json({error: 'The channel with the id was not found.'})
  const Channel = mongoose.connection.db.collection("devices");
  const channel = await Channel.aggregate([{$match: {_id: id}}, {$project: OUTPUT_FIELDS}]).toArray()
  if(!channel[0]) return res.status(404).json({error: 'Channel with the id was not found. Check access rights.'});
  res.send(channel[0])
  } catch(e){
    return res.status(500).json({error: 'Something went wrong'})
  }
}

module.exports = {getById}