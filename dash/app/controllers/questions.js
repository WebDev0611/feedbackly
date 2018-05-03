'use strict';

var auth = require('../lib/auth');
var render = require('../lib/render');
var Question = require('../models/question');
var QuestionFeedback = require('../models/question/questionfeedback');
var Fbevent = require('../models/fbevent');
var Survey = require('../models/survey');
var PrintJob = require('../models/printjob');
var render = require('../lib/render');
var intercom = require('../lib/intercom');
const rights = require('../lib/rights')

var results = require('./results');

var Promise = require('bluebird');
var _ = require('lodash');
var q = require('q');

function getMatchingQuestions(options) {
  var surveyIds = options.surveys;
  var questionIds = [];

  return Survey.find({ _id: { $in: surveyIds } }, { _id: 0, question_ids: 1 })
    .then(surveys => {
      questionIds = _.chain(surveys)
        .reduce((ids, survey) => ids.concat(survey.question_ids), [])
        .map(id => id.toString())
        .uniq()
        .value();

      return Question.find({ _id: { $in: questionIds }, hidden: { $ne: true } })
        .then(questions => {
          return (questions || [])
            .sort((a, b) => questionIds.indexOf(a._id.toString()) - questionIds.indexOf(b._id.toString()));
        });
  });
}

module.exports = function (app) {

    app.post('/api/questions/search',
      auth.isLoggedIn(),
      (req, res) => {
        getMatchingQuestions(req.body)
          .then(questions => res.json(questions))
          .catch(() => res.sendStatus(400));
      });

    app.get('/api/questions/:id', auth.isLoggedIn(), function (req, res) {

        function fetchQuestion() {
          var deferred = q.defer();

          Question.findOne({ _id: req.params.id }, function(err, question){
              deferred.resolve(question);
          });

          return deferred.promise;
        }

        function checkForFeedback() {
          var deferred = q.defer();

          Fbevent.findOne({ question_id: req.params.id }, function(erro, fb){
              if(fb){
                deferred.resolve(true);
              } else {
                deferred.resolve(false);
              }
          });

          return deferred.promise;
        }

        q.all([fetchQuestion(), checkForFeedback()])
          .spread(function(question, hasFeedback) {
            question = question.toObject();
            question.hasFeedback = hasFeedback;

            res.json(question);
          });
    });

    app.post('/api/questions/:id/results',
      auth.isLoggedIn(),
      rights.getEverythingMW(),
      (req, res) => {
        const responseLimit = _.get(req, 'userRights.responseLimit')
        results.questionResults(req.params.id, _.assign({}, req.body, { organizationId: req.user.activeOrganizationId(), responseLimit, language: req.user.settings.locale }))
          .then(results => res.json(results))
          .catch(err => render.error(req, res, { err }));
      });

    app.post('/api/questions', auth.isLoggedIn(), auth.canCreateSurvey, function (req, res) {
      var attributes = Question.populatableAttributes(req.body);

      var question = new Question(attributes);

      question.created_by = req.user._id;
      question.organization_id = req.user.activeOrganizationId();

      question.save(function (err, data) {
        render.api(res, err, data);
      });
    });

    app.delete('/api/questions/:id',
      auth.isLoggedIn(),
      auth.canEditQuestion(req => req.params.id),
      (req, res) => {
        Question.update({ _id: req.params.id }, { $set: { hidden: true } })
          .then(() => res.sendStatus(200))
          .catch(err => render.error(req, res, { err }));
      });

    app.put('/api/questions/:id', auth.isLoggedIn(), auth.canEditQuestion(req => req.params.id), (req, res) => {
      var attributes = Question.populatableAttributes(req.body);

      Question.findByIdAndUpdate(req.params.id, { $set: attributes }, function (err, data) {
        render.api(res, err, data);
      });
    });

    app.get('/api/questions',
      auth.isLoggedIn(),
      (req, res) => {
        Question.find({ organization_id: req.user.activeOrganizationId() })
          .then(questions => res.json(questions));
      });
};
