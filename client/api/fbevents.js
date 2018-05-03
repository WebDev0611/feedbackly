var _ = require('lodash')
var moment = require('moment');
var flow = require('middleware-flow');
var SurveyDevice = require('app-modules/models/surveydevices');
var Fbevent = require('app-modules/models/fbevent');
var validators = require('app-modules/middlewares/validators');
var fbevents = require('app-modules/middlewares/fbevents');
var organizations = require('app-modules/middlewares/organizations');
var questionTypes = require('app-modules/constants/question-types');
const { profanityFilter } = require('../app-modules/middlewares/profanity-filter/index');
var mongoose = require('mongoose');
var oid = mongoose.Types.ObjectId;
var counters = require('app-modules/utils/counters');

var UpsellHandler = require('app-modules/utils/upsell-handler');
var NotificationHandler = require('app-modules/utils/notification-handler');

var saveFeedback = require('./feedbacks').saveFeedback

var saveLastFeedback = function(device_id){
  var Device = mongoose.connection.db.collection("devices");
  Device.update({_id: mongoose.Types.ObjectId(device_id)}, {$set: {last_feedback: moment.utc().toDate() }}).then()
}

const saveFocuses = function(device_id, focuses){
  let $set = focuses ? {$set: { focuses}} : {$unset: { focuses: ""}}
  mongoose.connection.db.collection("devices").update({_id: mongoose.Types.ObjectId(device_id)}, $set)
}

const saveMarketingContact = function(fbevent){
  try{
    if(fbevent.question_type != 'Upsell') return;
    const email = _.find(fbevent.data, {id: 'email'});
    if(!email) return;

    const obj = {
      device_id: oid(fbevent.device_id),
      survey_id: oid(fbevent.survey_id),
      created_at: new Date(fbevent.created_at),
      language: fbevent.language,
      email: email.data,
      feedback_id: oid(fbevent.feedback_id),
      fbevent_id: oid(fbevent._id),
      organization_id: oid(fbevent.organization_id),
    }

    mongoose.connection.db.collection("marketing_contacts").update({fbevent_id: obj.fbevent_id}, {$set: obj}, {upsert: true}).then()
  } catch(e){ console.log(e) }
}

module.exports = app => {
  app.post('/api/fbevents',
    (req, res, next) => {

      saveFocuses(req.body.device_id, req.body.focuses)

      req.body.created_at_adjusted_ts = parseInt(req.body.created_at_adjusted_ts);
      req.body.chain_started_at = parseInt(req.body.chain_started_at);

      if(req.body.created_at_adjusted_ts > moment.utc().add(1, 'days').unix()){
        req.body.created_at_adjusted_ts = moment.utc().unix()
      }

      if(req.body.chain_started_at > moment.utc().add(1, 'days').unix()){
        req.body.chain_started_at= moment.utc().unix()
      }

      if(moment.utc(req.body.created_at).unix() > moment.utc().add(1, 'days').unix()){
        req.body.created_at = moment.utc().toDate();
      }
      saveLastFeedback(req.body.device_id);

      if(req.body.question_type == 'Slider'){
        req.body.data = _.map(req.body.data, d => { return {id: d.id, data: parseFloat(d.data) } } );
      }

      if(['Button', 'NPS'].indexOf(req.body.question_type) > -1){
        req.body.data = _.map(req.body.data, d => parseFloat(d));
      }


      next();
    },
    profanityFilter,
    validators.validateBody({
      _id: { presence: true },
      question_id: { presence: true },
      question_type: { presence: true, inclusion: Object.keys(questionTypes) },
      data: { presence: true, isArray: true },
      feedback_id: { presence: true },
      device_id: { presence: true },
      survey_id: { presence: true },
      created_at_adjusted_ts: { presence: true, timestamp: true },
      organization_id: { presence: true }
    }),
    fbevents.handlePeriodicFbeventCounter(req => req.body),
    fbevents.encryptFbevent(req => req.body), // changes req.body to req.fbevent
    fbevents.getPresetMetaByKey(req => req.fbevent),
    (req, res, next) => {
      saveFeedback(req.fbevent);
      saveMarketingContact(req.fbevent);

      var upserted = false;
      var feedback = req.fbevent;

      Fbevent.update({ _id: feedback._id }, { $set: Object.assign({}, feedback, { v4: true, period_sequence: req.fbeventPeriod }) }, { upsert: true })
        .then(status => {
          if(status.upserted) {
            upserted = true;
          }

          return Fbevent.findOne({ feedback_id: feedback.feedback_id }).sort('-created_at_adjusted_ts').exec()
        })
        .then(compareFbe => {
          var feedbacks = feedback.feedbacks;

          if(Object.keys(compareFbe.feedbacks).length > Object.keys(feedback.feedbacks)) {
            feedbacks = compareFbe.feedbacks;
          }

          return feedbacks;
        })
        .then(feedbacks => {
          return Fbevent.update({ feedback_id: feedback.feedback_id }, { $set: { feedbacks } }, { multi: true });
        })
        .then(() => {
          if(upserted) {
            counters.increase(counters.getCounterFromFbevent(feedback));
          }

          if(upserted){
            UpsellHandler.handle(req.body);
            NotificationHandler.handle(req.body);
          }

          return res.json({
            _id: feedback._id
          });

        })
        .catch(err => next(err));

        SurveyDevice.update({survey_id: req.body.survey_id, device_id: req.body.device_id}, {$set: {survey_id: req.body.survey_id, device_id: req.body.device_id}}, {upsert: true}).exec()
    });

}
