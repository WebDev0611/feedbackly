'use strict';

var q = require('q');
var Promise = require('bluebird');
var auth = require('../lib/auth');
var validator = require('../lib/request-validator');
var render = require('../lib/render');
var Survey = require('../models/survey');
var Device = require('../models/device');
var Feedback = require('../models/feedback');
var Fbevent = require('../models/fbevent');
var intercom = require('../lib/intercom');

var Question = require('../models/question');
var ScheduledSurvey = require('../models/scheduledsurvey');
var _ = require('lodash');
var moment = require('moment');
var render = require('../lib/render');
var questionEmails = require('./question-emails');
var smsMessages = require('./sms-messages');
var SurveyDevices = require('../models/surveydevices')
var apiConstants = require('../lib/constants/api');

const MiniId = require('../lib/mini-id');
const Sms = require('../api/sms')

function getSurveySchedulations(req, res) {
  var query = req.query.type
    ? { type: req.query.type }
    : {};

  var cursor = ScheduledSurvey.find(_.assign({ survey_id: req.params.id }, query));

  cursor.populate('device_ids');

  cursor.exec((err, schedulations) => {
    if(err) {
      res.sendStatus(500);
    } else {
      res.json(schedulations);
    }
  });
}

function activateSurveyOnDevices(surveyId, devices){
  return Device.update({ _id: { $in: devices } }, { $set: { active_survey: surveyId, latest_activation: moment.utc().unix() }, $unset: { ipad_setup_device: 1} }, { multi: true })
}

function scheduleSurvey(opts) {

  if(isNaN(opts.timestamp)) {
    return new Error({type: 400, message: "invalid timestamp"})
  }

  return ScheduledSurvey.create({
    data: opts.data || {},
    timestamp: opts.timestamp,
    time: opts.time,
    type: opts.type,
    device_ids: opts.device_ids,
    survey_id: opts.survey_id,
    organization_id: opts.organization_id
  })
}

function getSurveysWithMeta(options) {
  return Survey.findWithMeta({
    organizationId: options.organizationId,
    showArchived: options.showArchived,
    includeQuestions: options.includeQuestions,
    skip: options.skip,
    limit: options.limit,
    bindToUser: options.user
  });
}

function getSurveys(options) {
  var query = { archived: false };

  return Survey.surveyIdsOfUser(options.user)
    .then(ids => {

      if(options.showArchived === true) {
        delete query.archived;
      }

      query = _.assign({}, query, { _id: { $in: ids } });

      var findExecutor = Survey.find(query);

      if(options.includeQuestions === true) {
        findExecutor = findExecutor.populate('question_ids');
      }

      return findExecutor.exec();
    });
}

module.exports = function (app) {

    app.get('/api/surveys',
      auth.isLoggedIn(),
      (req, res) => {
        var showArchived = req.query.show_archived === 'true';
        var includeQuestions = req.query.include_questions === 'true';
        var includeMeta = req.query.include_meta === 'true';
        var organizationId = req.user.activeOrganizationId();

        var promise;
        var options = { showArchived, includeQuestions, organizationId, user: req.user };
        if(includeMeta === true) {
          promise = getSurveysWithMeta(_.assign({}, options, { skip: parseInt(req.query.skip || 0), limit: Math.min(parseInt(req.query.limit || 0), apiConstants.MAX_PAGE_SIZE) }));
        } else {
          promise = getSurveys(options);
        }

        promise
          .then(data => res.json(data))
          .catch(err => render.error(req, res, { err }));
      });

    app.get('/api/surveys/:id/feedbacks', auth.isLoggedIn(), function(req, res){
        Feedback.count({survey_id: req.params.id, organization_id: req.user.activeOrganizationId()}, function(err, count){
            render.api(res, err, '{"count":'+count+'}');
        });
    });

    app.get('/api/surveys/:id',
      auth.isLoggedIn(),
      auth.surveyIsInOrganization(req => req.params.id),
      (req, res) => {
        var includeQuestions = req.query.include_questions === 'true';

        Survey.findOne({ _id: req.params.id, organization: req.user.activeOrganizationId() })
          .then(survey => {
            if(includeQuestions === false) {
              return res.json(survey);
            } else {
              Question.findWithMeta({ _id: { $in: survey.question_ids } })
                .then(questions => {
                  questions = questions || [];

                  var questionIds = _.map(survey.question_ids || [], id => id.toString());

                  questions.sort((a, b) => questionIds.indexOf(a._id.toString()) - questionIds.indexOf(b._id.toString()));

                  return res.json(_.assign(survey.toJSON(), { question_ids: questions }));
                });
            }
          });
    });

    app.get('/api/surveys/:id/first_question', auth.isLoggedIn(), (req, res) => {
      Survey.getFirstQuestion(req.params.id)
        .then(question => res.json(question))
        .catch(err => render.error(req, res, { err }));
    });

    app.get('/api/surveys/:id/schedulations',
      auth.isLoggedIn(),
      auth.surveyIsInOrganization(req => req.params.id),
      getSurveySchedulations)

    app.get('/api/surveys/:id/active_devices',
      auth.isLoggedIn(),
      auth.surveyIsInOrganization(req => req.params.id),
      (req, res) => {
        var includeMeta = req.query.include_meta === 'true';

        req.user.devices({ active_survey: req.params.id })
          .then(devices => {

            if(includeMeta) {
              return Device.findWithMeta({ _id: { $in: _.map(devices, '_id') } })
                .then(devicesWithMeta => res.json(devicesWithMeta));
            } else {
              return res.json(devices);
            }
          })
          .catch(err => render.error(req, res, { err }));
      });

    app.post('/api/surveys/:id/active_devices',
      auth.isLoggedIn(),
      auth.surveyIsInOrganization(req => req.params.id),
      auth.canAccessDevices(req => req.body.devices),
      (req, res) => {
        Device.update({ _id: { $in: req.body.devices } }, { $set: { active_survey: req.params.id, latest_activation: moment.utc().unix() } }, { multi: true })
    			.then(() => res.sendStatus(200))
    			.catch(() => res.sendStatus(500));
      });

    app.post('/api/surveys/:id/copy',
      auth.isLoggedIn(),
      auth.surveyIsInOrganization(req => req.params.id),
      auth.canCreateSurvey,
      (req, res) => {
        Survey.createCopy({ surveyId: req.params.id, createdBy: req.user._id })
          .then(survey => res.json(survey))
          .catch(err => {
            return render.error(req, res, { err })
          });
      });

    app.post('/api/surveys',
      auth.isLoggedIn(),
      auth.canCreateSurvey,
      (req, res) => {
        var survey = new Survey(Survey.populatableAttributes(req.body));

        survey.created_by = req.user._id;
        survey.organization = req.user.activeOrganizationId();
        survey.languages = [_.get(req.user,'settings.locale') || 'en'];
        survey.save(function (err, data) {
  	      render.api(res, err, data);
        });
      });


    app.put('/api/surveys/:id', auth.isLoggedIn(), auth.canEditSurvey(req => req.params.id), (req, res) => {
      var surveyId = req.params.id;

      var attributes = Survey.populatableAttributes(req.body);

      Survey.findOneAndUpdate({ _id: surveyId },
        { $set: Object.assign({}, attributes, { updated_at: moment.utc().unix() }) },
        { runValidators: true, new: true })
        .then(survey => res.json(survey))
        .catch(err => render.error(req, res, { err }));
    });


    app.post('/api/surveys/:id/publish',
    auth.isLoggedIn(),
    validator.bodyRequirements(['schedule.plan', 'activeChannels']),
    auth.surveyIsInOrganization(req => req.params.id),
    auth.canAccessDevices(req => _.map(req.body.activeChannels, '_id')),
    (req, res) => {
      var promises = [];
      var errors = [];

        var schedule = req.body.schedule;
        if(schedule.plan == "schedule"){
          var scheduleSettings = {
            timestamp: schedule.time.unix,
            time: schedule.time,
            survey_id: req.params.id,
            organization_id: req.user.activeOrganizationId()
          }
        }

        var devices = _.without(req.body.activeChannels, {type: 'EMAIL'});

        // Intercom update for iPad setup finish
        Device.count({_id: {$in: devices}, ipad_setup_device: true}).then( count => {
          if(count) intercom.createEvent(req.user._id.toString(),'ipad_setup_finished');
        });


        devices = _.without(devices, {type: 'SMS'});
        if(schedule.plan === "schedule"){
          promises.push(scheduleSurvey(_.assign({type: "ACTIVATION", device_ids: _.map(devices, "_id")}, scheduleSettings)));
        } else if (schedule.plan == "now"){
          promises.push(activateSurveyOnDevices(req.params.id, _.map(devices, '_id')));
        }

        var emails = _.filter(req.body.activeChannels, {type: 'EMAIL'});
        if(emails.length > 0 && req.body.emailSettings){
            if(schedule.plan === "schedule"){
              promises.push(scheduleSurvey(_.assign({type: "EMAIL", device_ids: _.map(emails, "_id"), data: req.body.emailSettings}, scheduleSettings)));
            } else if (schedule.plan == "now"){
              promises.push(questionEmails.sendSurveyAsEmail(req.body.emailSettings, _.map(emails, '_id')));
            }
          }

        var sms = _.filter(req.body.activeChannels, {type: 'SMS'});
        if(sms.length > 0 && req.body.smsSettings){

          var smsSettings = _.assign(req.body.smsSettings, {devices: _.map(sms, '_id'), surveyId: req.params.id, organizationId: req.user.activeOrganizationId(), batchId: MiniId.generate(Date.now())})
          if(schedule.plan === "schedule"){
            promises.push(scheduleSurvey(_.assign({type: "SMS", device_ids: _.map(sms, "_id"), data: smsSettings}, scheduleSettings)));
          } else if (schedule.plan == "now"){
            promises.push(Sms.send(smsSettings));
          }
        }

      Promise.all(promises).then(info => {
        console.log(`User ${req.user.email} published survey ${req.params.id}`)
        console.log('info', info);
        res.sendStatus(200);
      }).catch(err => { console.error(err); res.status(500).json({error: 'Couldn`t save survey'})});
    }
  )



};
