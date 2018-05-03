const mongoose = require('mongoose');
const moment = require('moment');
const cache = require('../lib/cache');

const FeedbackSchema = new mongoose.Schema({ created_at: Date }, { strict: false })
FeedbackSchema.index({ created_at: 1 })
const Feedback = mongoose.model('Feedback', FeedbackSchema);


const getCountFor30Days = async function (req, res) {
  let fbCount = await cache.get('FEEDBACK_COUNT');

  if (!fbCount) {
    fbCount = await Feedback.count({});
    fbCount+= 5000000
    cache.set('FEEDBACK_COUNT', fbCount, { ttl: 30 }); // 30 seconds ttl
  }

  res.send({ fbCount })
}

module.exports = { getCountFor30Days }