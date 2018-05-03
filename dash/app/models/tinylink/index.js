var mongoose = require('mongoose');
var _ = require('lodash');

var TinyLinkCounter = require('./tinylinkcounter');

var tinyLinkSchema = mongoose.Schema({
  _id: { type: String, required: true },
  code: { type: String }
});

tinyLinkSchema.statics.getLink = function(url) {
  var tinyUrl = process.env.TINY_CLIENT_URL;

  return this.findById(url)
    .then(link => {
      if(!link) {
        var newLink = new mongoose.models.TinyLink({ _id: url });

        return newLink.save()
          .then(() => {
            return `${tinyUrl}/l/${newLink.code}`;
          });
      } else {
        return `${tinyUrl}/l/${link.code}`;
      }
    });
}

tinyLinkSchema.pre('save', function(next) {
  TinyLinkCounter.increase()
    .then(counter => {
      var randomString = _.range(0, 3).map(value => Math.round(Math.random() * 35).toString(36)).join('');

      this.code = `${(counter).toString(36)}${randomString}`;

      next();
    });
});

module.exports = mongoose.model('TinyLink', tinyLinkSchema);
