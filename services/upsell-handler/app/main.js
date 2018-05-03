var Fns = require('./functions')
var send = require('./mailer/send')
var Promise = require('bluebird')
var ObjectID = require('mongodb').ObjectID;
var _ = require('lodash')

function handleIncomingUpsellFbevent(fbevent, db){

  var language = fbevent.language;

  var emails = _.map(_.filter(fbevent.data, {id: 'email'}), 'data');
  console.log(emails)

  var promise1 = db.collection('devices').findOne({_id: ObjectID(fbevent.device_id)})
    .then(device => Fns.getUpsellsFromDevice(device))

  var promise2 = db.collection('fbevents').find({feedback_id: ObjectID(fbevent.feedback_id)}).toArray()
    .then(fbevents => Fns.calculateAverageOfFbevents(fbevents))


  return Promise.all([promise1, promise2])
    .spread((upsells, average) => {

      console.log(upsells, average)

      var upsellId = Fns.getUpsellByAverage(upsells, average);
      return db.collection('upsells').findOne({_id: upsellId});
    })
    .then(upsell => Fns.buildEmailFromUpsell(upsell, emails, language))
    .then(email => send(email))

}


module.exports = {handle: handleIncomingUpsellFbevent}
