const Survey = require('../models/survey');
const Question = require('../models/question');
const Fbevent = require('../models/fbevent');
const _ = require('lodash');
const moment = require('moment');

function put(req, res) {
  var surveyId = req.params.id;
  var questions = req.body.question_ids;
  req.body.question_ids = questions.map(q => q._id);

  var attributes = Survey.populatableAttributes(req.body);


  var surveyUpdate = Survey.findOneAndUpdate({ _id: surveyId },
      { $set: Object.assign({}, attributes, { updated_at: moment.utc().unix() }) },
      { runValidators: true, new: true });

  var questionUpdates = Promise.all(
    questions.map(q => {
      var attributes = Question.populatableAttributes(q);
      attributes._id = q._id;
      attributes.created_by = req.user._id;
      attributes.createdAt = new Date();
      attributes.organization_id = req.user.activeOrganizationId();
      _.set(
        attributes,
        "opts.smallScale",
        q.question_type == "Slider" &&
          [
            "572305be196d36ea003d0100",
            "58dd5c034568e139cc5a8389",
            "587cde3cedb5d43c4a7cf59a",
            "5936f101fa21e400018c03f9",
            "58b73e6ad302752ec0a9db6e",
            "59fb8712c0f2630001ecc021"
          ].indexOf(req.user.activeOrganizationId().toString()) > -1
      );
      return Question.findOneAndUpdate(
        { _id: q._id },
        { $set: attributes },
        { new: true, upsert: true }
      );
    })
  );

  Promise.all([surveyUpdate].concat(questionUpdates))
    .then(arr => {
      var survey = arr[0];
      var questions = _.keyBy(arr[1], '_id');
      survey.question_ids = survey.question_ids.map(v => questions[v]);

      console.log(`User ${req.user.email} edited survey ${survey.name}, ${survey._id}`)
      res.json(survey);
    })
    .catch(err => {
      console.error(err)
      res.status(500).json({ error: err });
    });
}

function setQuestionFlags(survey) {
  var feedbackFlagPromises = survey.question_ids.map(question => {
    return Fbevent.findOne({ question_id: question._id });
  });
  return Promise.all(feedbackFlagPromises).then(feedbackFlags => {
    feedbackFlags.forEach(
      (val, id) => (survey.question_ids[id].has_feedback = val !== null)
    );

    return survey;
  });
}

function setFeedbackFlags(question) {
  return Fbevent.distinct('data', { question_id: question._id }).then(_ids => {
    var ids = _.keyBy(_ids);
    if (['Image', 'Slider', 'Word', 'Contact'].includes(question.question_type))
      question.choices.forEach(c => {
        c.has_feedback = c.id in ids;
      });
    question.has_feedback = _ids.length > 0;
  });
}

function get(req, res) {
  var surveyId = req.params.id;

  Survey.findOne({ _id: surveyId })
    .populate('question_ids')
    .then(survey => {
      var surveyObject = survey.toJSON();
      Promise.all(surveyObject.question_ids.map(setFeedbackFlags)).then(() =>
        res.json(surveyObject)
      );
    })
    .catch(err => {
      res.status(500).json({ error: err });
    });
}

function getAll(req, res) {
  Survey.surveyIdsOfUser(req.user)
    .then(ids => {
      return Survey.find({ _id: { $in: ids }, archived: false })
        .populate('question_ids')
        .exec();
    })
    .then(all => {
      res.json(
        all.map(s => {
          var obj = s.toJSON();
          obj.questions = obj.question_ids;
          delete obj.question_ids;
          return obj;
        })
      );
    });
}

module.exports = { put, get, getAll };
