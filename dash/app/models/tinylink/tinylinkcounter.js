var mongoose = require('mongoose');

var tinyLinkCounterSchema = mongoose.Schema({
  _id: { type: Number, default: 0, required: true },
  counter: { type: Number },
});

tinyLinkCounterSchema.statics.increase = function() {
  return mongoose.models.TinyLinkCounter.findOneAndUpdate({ _id: 0 }, { $inc: { counter: 1 } }, { upsert: true, new: true })
    .then(counter => {
      return counter.counter;
    });
}

module.exports = mongoose.model('TinyLinkCounter', tinyLinkCounterSchema);
