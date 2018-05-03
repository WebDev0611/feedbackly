// move to api at some point

const mongoose = require('mongoose');

const oid = mongoose.Types.ObjectId;
const _ = require('lodash');
const moment = require('moment');
const feedbackCounters = require('./utils/feedbackcounters');
const getContactData = require('./utils/get_contact_data').getContactData;

function date(d) {
  const dd = moment.utc(d).toDate();
  return dd;
}

function average(array) {
  const len = array.length;
  if (len === 0) return 0;
  let sum = 0;
  array.forEach((i) => {
    sum += i;
  });
  return sum / len;
}

async function saveFeedback(fb) {
  try {
    var counts = await feedbackCounters.getFeedbackCounter(oid(fb.organization_id));
  } catch (e) {
    console.log('feedback counter failed');
  }

  try{

  const feedbackObj = {
    _id: oid(fb.feedback_id),
    survey_id: oid(fb.survey_id),
    device_id: oid(fb.device_id),
    organization_id: oid(fb.organization_id),
    created_at_adjusted_ts: fb.created_at_adjusted_ts,
    created_at: date(fb.created_at),
    meta_browser: _.get(fb, 'meta_browser') || {},
    meta_query: _.map(_.get(fb, 'meta_query') || {}, (val, key) => ({ key, val })),
    language: fb.language,
    period_sequence: _.get(counts, 'counter.count') || 0,
  };

  let data;
  if (['Button', 'NPS', 'Text', 'Image'].indexOf(fb.question_type) > -1) {
    if (['Button', 'NPS'].indexOf(fb.question_type) > -1) {
      data = parseFloat(fb.data[0]);
    } else data = fb.data[0];
  } else data = fb.data;

  const operations = {
    $setOnInsert: feedbackObj,
    $addToSet: {
      data: {
        value: data,
        question_type: fb.question_type,
        question_id: oid(fb.question_id),
        _id: oid(fb._id),
        created_at: date(fb.created_at),
      },
    },
  };

    const contactData = getContactData(fb, data, feedbackObj.meta_query);
    if(contactData != false) {
      operations.$set = operations.$set || {}
      _.forEach(contactData, (val, key) => operations.$set = {...operations.$set, [`contact.${key}`]: val})
    }

    if(['Text', 'Contact'].indexOf(fb.question_type) > -1) {
      operations.$addToSet.data.crypted = _.get(fb, 'crypted') || false
      operations.$addToSet.data.filtered = _.get(fb, 'filtered') || false
      operations.$addToSet.data.hidden = _.get(fb, 'filtered') || false      
    }

  const Feedback = mongoose.connection.db.collection('feedbacks');
  Feedback.update({ _id: feedbackObj._id }, operations, { upsert: true }).then((a) => {
    if (a.result.upserted) {
      try {
        feedbackCounters.increaseFeedbackCounter(oid(fb.organization_id), _.get(counts, 'period'));
      } catch (e) {
        console.log('feedback counter failed');
      }
    }
  });
  } catch(e){
    console.log(e)
  }
}

module.exports = { saveFeedback };
