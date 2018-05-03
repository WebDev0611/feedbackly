var Device = require('app-modules/models/device');

function assignUpsellsQuery(deviceId, upsells){
  var upsells_valid = {};
  ['neutral', 'positive', 'negative'].forEach(us => {
    if(upsells[us] && upsells[us].length > 0) upsells_valid[us] = upsells[us];
  })

  return {query: {_id: deviceId}, set: {$set: {upsells: upsells_valid}}}
}

function assignUpsellsForEngagePoint(deviceId, upsells){
  var q = assignUpsellsQuery(deviceId, upsells);
  console.log(q)
  return Device.update(q.query, q.set)
}

module.exports = { assignUpsellsForEngagePoint }
