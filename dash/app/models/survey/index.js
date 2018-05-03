'use strict';

var mongoose = require('mongoose');
var Promise = require('bluebird');

var Question = require('../question');
var Surveyfeedback = require('./surveyfeedback');
var SurveyDevices = require('../surveydevices');
var Device = require('../device');
var Fbevent = require('../fbevent');

var _ = require('lodash');
var moment = require('moment')

var apiConstants = require('../../lib/constants/api');
var questionTypes = require('../../lib/constants/question').questionTypes;

var surveySchema = mongoose.Schema({
    name: { type: String, required: true, minlength: 1 },
    created_by: { type: mongoose.Schema.Types.ObjectId, required: true},
    created_at: {type: Date, default: Date.now},
    updated_at: { type: Number, default: moment.utc().unix() },
    organization: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Organization' },
    archived: { type: Boolean, default: false, required: true },
    question_ids: [{type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    languages: Array,
    properties: Object,
    generated: { type: Boolean, default: false },
    public: {type: Boolean, default: false},
    ipad_example_survey: {type:Boolean, required: false}
});


function feedbackCountMap(surveys) {
  var surveyIdToCounts = {};

  var stream = Surveyfeedback.find({ _id: { $in: _.map(surveys, survey => survey._id) } }).stream();

  return new Promise((resolve, reject) => {
    stream.on('data', count => {
      stream.pause()
      var key = count._id.toString();
      surveyIdToCounts[key] = count.feedback_count || 0;
      stream.resume()
    });

    stream.once('end', () => resolve(surveyIdToCounts));
    stream.once('error', () => reject());
  });
}

function activeDevicesMap(surveys) {
  var surveyIdToActiveDevices = {};

  var stream = Device.find({ active_survey: { $in: _.map(surveys, survey => survey._id) } }).stream();

  return new Promise((resolve, reject) => {
    stream.on('data', device => {
      stream.pause()
      var activeSurvey = device.active_survey;

      if(activeSurvey !== undefined) {
        var key = activeSurvey.toString()

        surveyIdToActiveDevices[key] = surveyIdToActiveDevices[key] || [];
        surveyIdToActiveDevices[key].push(device);
      }
      stream.resume()
    });

    stream.once('end', () => resolve(surveyIdToActiveDevices));
    stream.once('error', () => reject());
  });
}

surveySchema.statics.createCopy = function(options) {
  return this.findOne({ _id: options.surveyId })
    .populate('question_ids')
    .exec()
    .then(survey => {
      if(!survey) {
        return Promise.reject();
      }

      var surveyCopy = _.omit(survey.toJSON(), ['_id']);

      var questions = (survey.question_ids || []).map((question, index) => {
        return _.omit(question.toJSON(), ['_id', 'createdAt']);
      });

      var idToIndex = (survey.question_ids || []).reduce((map, question, index) => {
        map[index.toString()] = question._id.toString();

        return map;
      }, {});

      return Promise.all(questions.map(question => Question.create(question)))
        .then(copiedQuestions => {

          var oldIdToNewId = copiedQuestions.reduce((map, question, index) => {
            map[idToIndex[index.toString()]] = question._id.toString();

            return map;
          }, {});

          var oldLogic = _.get(surveyCopy, 'properties.logic') || {};

          var logic = _.keys(oldLogic)
            .reduce((logicMap, logicKey) => {
              if(oldIdToNewId[logicKey]) {
                logicMap[oldIdToNewId[logicKey]] = _.keys(oldLogic[logicKey] || {})
                  .reduce((valueMap, valueKey) => {
                    if(oldIdToNewId[oldLogic[logicKey][valueKey]]) {
                      valueMap[valueKey] = oldIdToNewId[oldLogic[logicKey][valueKey]];
                    } else {
                      valueMap[valueKey] = oldLogic[logicKey][valueKey];
                    }

                    return valueMap;
                  }, {});
              }

              return logicMap;
            }, {});


          return this.create(_.assign({}, surveyCopy, { question_ids: copiedQuestions.map(question => question._id.toString()), name: `${surveyCopy.name} (copy)`, created_by: options.createdBy, properties: _.assign({}, surveyCopy.properties || {}, { logic }) }));
        });
    });
}

surveySchema.statics.populatableAttributes = function(object) {
  return _.pick(object, ['name', 'archived', 'question_ids', 'languages', 'properties', 'customPrivacyPolicy', 'subquestions', 'notHiddenQuestionCount'])
}

surveySchema.statics.getFirstQuestion = function(surveyId) {
  return this.findOne({ _id: surveyId }, { _id: 0, question_ids: { $slice: 1 } })
    .exec()
    .then(survey => {
      if(!_.get(survey, 'question_ids[0]')) {
        return undefined;
      } else {
        return Question.findOne({ _id: survey.question_ids[0] }).exec();
      }
    });
}

surveySchema.statics.feedbackCountOfDevices = function(deviceIds) {
  var match = {
    device_id: { $in: _.map(deviceIds, id => mongoose.Types.ObjectId(id)) }
  };

  var group = {
    _id: '$survey_id',
    count: { $sum: 1 }
  };

  var a = Fbevent.aggregate([
    { $match: match },
    { $group: group }
  ])
  a.options = { allowDiskUse: true, useCursor: true }
  return a;
}

surveySchema.statics.surveyIdsOfUser = function(user) {
  var orgid = user.activeOrganizationId() || user.organization_id[0];
  return user.devices()
    .then(devices => {
      return SurveyDevices.find({device_id: {$in: _.map(devices, "_id")}})
    })
     .then(surveyDevices => {
        return this.find({$or: [{created_by: user._id, organization: orgid }, {organization: orgid, public: true}]}).distinct("_id")
        .then(ids => {
          return _.uniq([..._.map(surveyDevices, "survey_id"), ...ids]);
        })
    })
}

surveySchema.statics.findWithMeta = function(options) {
  var query = { organization: options.organizationId, archived: false };

  if(options.showArchived === true) {
    delete query.archived;
  }

  var queryGetter = Promise.resolve();

  if(options.bindToUser !== undefined) {
    queryGetter = this.surveyIdsOfUser(options.bindToUser)
      .then(surveyIds => {
        query = _.assign({}, query, { _id: { $in: surveyIds } });
      });
  }

  var findSurveys = queryGetter
    .then(() => {
      var findPromise = this.find(query);

      if(options.includeQuestions === true) {
        findPromise = findPromise.populate('question_ids');
      }

      return findPromise
        .skip(options.skip)
        .limit(options.limit)
        .sort({ _id: -1 })
        .exec();
    });

  return Promise.all([
    findSurveys,
    this.count(query)
  ]).spread((surveys, count) => {
    return Promise.all([
      feedbackCountMap(surveys),
      activeDevicesMap(surveys)
    ]).spread((surveyIdToCounts, surveyIdToActiveDevices, surveyIdToQuestionCount) => {
      var list = _.map(surveys, survey => {
        return _.assign({}, survey.toJSON(), {
          active_devices: surveyIdToActiveDevices[survey._id.toString()] || [],
          feedback_count: surveyIdToCounts[survey._id.toString()] || 0
        });
      });

      return { list, count };
    });

  });
}

surveySchema.statics.generateTutorialSurvey = function(options) {
  var base = {
    name: options.surveyName || 'Example survey',
    organization: options.organizationId,
    created_by: options.createdBy,
    languages: ['en'],
    properties: {
      end_screen_text: {
          'en': 'Thank you for your feedback!' ,
          'fi': 'Kiitos palautteestasi!' ,
          'sv': 'Tack för din respons!'
      }
    },
    generated: true
  }
  if(options.isIpadClient) base.ipad_example_survey = true;

  var questionOrder = [questionTypes.Button, questionTypes.Word, questionTypes.NPS, questionTypes.Text, questionTypes.Contact];

  var questions = _.map(questionOrder, questionType => Question.getGeneratedQuestion({ questionType, organizationId: options.organizationId, createdBy: options.createdBy }));

  return Question.insertMany(questions)
    .then(newQuestions => {
      var questionIds = _.map(newQuestions, question => question._id);

      return this.create(_.assign({}, base, { question_ids: questionIds }));
    });
}

module.exports = mongoose.model('Survey', surveySchema);
