var mongoose = require('mongoose');

var tinyLinkSchema = mongoose.Schema({
  _id: { type: String, required: true },
  code: { type: String }
});

tinyLinkSchema.statics.getUrl = function(code) {
  return this.findOne({ code })
    .then(link => {
      if(link) {
        return link._id;
      } else {
        return null;
      }
    });
}

module.exports = mongoose.model('Tinylink', tinyLinkSchema);
