var mongoose = require('mongoose');
var _ = require('lodash');



const ObjectID = require('mongodb').ObjectID;

mongoose.connect('mongodb://localhost/feedbackly-test', {}, main);

mongoose.model('Fbevents', new mongoose.Schema({}, { strict: false }));
var mod = 1;
var eq = 0;
if(process.argv.length > 3) {
  mod = parseInt(process.argv[2]);
  eq = parseInt(process.argv[3]);
}

var totalcount, count = 0;

async function addEntries(entries) {
  if(entries.length) await mongoose.connection.db.collection('marketing_contacts').insert(entries);
  count += entries.length;
  console.log(`${count}/${totalcount}`);
}

async function main() {
  try {
  var Fbevents = mongoose.connection.model('Fbevents');

  var db = mongoose.connection.db;
  var query = {
    question_type: 'Upsell',
    chain_started_at: {$mod: [mod, eq]}
  };

  totalcount = await Fbevents.count(query);


  var stream = Fbevents.find(query).cursor();
  var entries = [];
  let fb;
  while(fb = await stream.next()) {
    var fbevent = fb.toObject();
    var email = _.find(_.map(_.filter(fbevent.data, {id: 'email'}), 'data'));
    var terms = _.find(_.map(_.filter(fbevent.data, {id: 'terms'}), 'data'));
    if(email && terms == '254e0d6e') {

      var language = _.get(await db.collection('feedbacks').findOne({_id: ObjectID(fbevent.feedback_id)}), 'language');

      entries.push({
        email,
        fbevent_id: ObjectID(fbevent._id),
        device_id: ObjectID(fbevent.device_id),
        survey_id: ObjectID(fbevent.survey_id),
        organization_id: ObjectID(fbevent.organization_id),
        created_at: fbevent.created_at,
        language
      });
    } else count++;
    if(entries.length == 100) {
      await addEntries(entries);
      entries = [];
    }
  }
  await addEntries(entries);


} catch(err) {
  console.error(err);
  process.exit(1);
}
  process.exit();
}
