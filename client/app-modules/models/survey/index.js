// app/models/survey.js
'use strict';

var mongoose = require('mongoose');

var surveySchema = mongoose.Schema({
    name          : { type: String, required: true, minlength: 1 },
    created_by    : { type: mongoose.Schema.Types.ObjectId, required: true},
    updated_at: { type: Number },
    organization  : { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Organization' },
    archived      : { type: Boolean, default: false, required: true },
    question_ids  : [{type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    languages     : Object,
    properties    : Object,
    ipad_example_survey: {type: Boolean, required: false}
});

var withoutHiddenQuestions = survey => {
  return Object.assign({}, survey.toJSON(), { question_ids: (survey.question_ids || []).filter(question => question.toJSON().hidden !== true) });
}

surveySchema.statics.findOneWithoutHiddenQuestions = function(query) {
  return this.findOne(query)
    .populate('question_ids')
    .exec()
    .then(survey => {
      if(!survey) {
        return survey;
      } else {
        return withoutHiddenQuestions(survey);
      }
    });
}

module.exports = mongoose.model('Survey', surveySchema);
