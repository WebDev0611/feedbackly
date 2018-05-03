'use strict';

var _ = require('lodash');
var mongoose = require('mongoose');
var Promise = require('bluebird');

var QuestionFeedback = require('./questionfeedback');
var questionTypes = require('../../lib/constants/question').questionTypes;

var questionSchema = mongoose.Schema({
  question_type: { type: String, required: true, enum: _.values(questionTypes) },
  organization_id : {type: mongoose.Schema.Types.ObjectId, required: true},
  created_by: {type: mongoose.Schema.Types.ObjectId},
  createdAt: {type: Date, default: Date.now},
  opts: Object,
  generated: { type: Boolean, default: false },
  heading: Object,
  subtitle: Object,
  choices: Array,
  placeholder: Object,
  displayProbability: { type: Number, default: 1 }
},{ minimize: false});

function fbeventCountMap(questions) {
  return QuestionFeedback.find({
    _id: { $in: _.map(questions || [], question => question._id) }
  }).then(counts => {
    var map = {};

    (counts || []).forEach(count => {
      map[count._id.toString()] = count.fbevent_count || 0;
    });

    return map;
  });
}

questionSchema.statics.populatableAttributes = function(object) {
  return _.pick(object, [
    'question_type',
    'heading',
    'subtitle',
    'choices',
    'placeholder',
    'opts',
    'displayProbability'
  ]);
};

questionSchema.statics.findWithMeta = function(query) {
  return this.find(query).then(questions => {
    return questions;
  });
};

questionSchema.statics.getGeneratedQuestion = function(options) {
  var base = {
    question_type: options.questionType,
    organization_id: options.organizationId,
    created_by: options.createdBy,
    choices: [],
    opts: {},
    generated: true
  };

  var nextId = 0;
  var id = () => (nextId++).toString();

  var generators = {
    [questionTypes.Button]: () => {
      return {
        opts: {},
        heading: {
          en: 'How would you rate our customer service today?'
        },
        choices: [
          {
            id: '000',
            text: {
              en: 'TERRIBLE.'
            }
          },
          {
            id: '025',
            text: {
              en: 'BAD.'
            }
          },
          {
            id: '050',
            text: {
              en: 'OK.'
            }
          },
          {
            id: '075',
            text: {
              en: 'GOOD.'
            }
          },
          {
            id: '100',
            text: {
              en: 'AWESOME.'
            }
          }
        ]
      };
    },
    [questionTypes.NPS]: () => {
      return {
        heading: {
          en: 'How likely would you recommend us to a friend or a colleague?'
        },
        subtitle: {
          en: '10 = extremely likely, 0 = extremely unlikely'
        }
      };
    },
    [questionTypes.Word]: () => {
      var ids = [];
      var texts = [
        'Newspaper',
        'TV',
        'Website',
        'Google',
        'Facebook',
        "I haven't seen"
      ];
      var choices = texts.map(t => ({ id: id(), text: { en: t } }));
      return {
        heading: {
          en: 'Where did you see our advert last?'
        },
        choices
      };
    },
    [questionTypes.Text]: () => {
      return {
        heading: {
          en: 'How could we improve our service?'
        }
      };
    },
    [questionTypes.Contact]: () => {
      var ids = [];
      _.times(2, i => {
        ids.push(id());
      });

      return {
        heading: {
          en:
            'Subscribe to our newletter to receive monthly offers to your inbox!'
        },
        choices: [
          { id: ids[0], text: { en: 'Name' }, type: 'string' },
          { id: ids[1], text: { en: 'Email' }, type: 'string' }
        ]
      };
    }
  };

  return _.assign({}, base, generators[options.questionType]() || {});
};

module.exports = mongoose.model('Question', questionSchema);
