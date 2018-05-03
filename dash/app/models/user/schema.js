var _ = require('lodash');
var mongoose = require('mongoose');

var organizationConstants = require('../../lib/constants/organization');

var userSchema = mongoose.Schema({
  email: { type: String, validate: /@/, required: true },
  password: { type: String, required: true, minlength: 6 },
  displayname: { type: String, required: true, minlength: 2 },
  organization_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }],
  organization_admin: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }],
  default_organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  tutorials_finished: [{type: String}],
  member_since: { type: Date, required: true, default: Date.now },
  settings: {
    locale: { type: String, required: true, default: 'en' },
    active: { type: Boolean, required: true, default: true },
    timezone: { type: String, required: true, default: '120' },
    receive_digest: { type: Boolean, required: true, default: false },
    send_device_notifications: { type: Boolean, default: false }
  },
  system_admin: { type: Boolean, default: false },
  segment: {
    type: String,
    enum: _.values(organizationConstants.segment)
  },
  ipadSignupToken: { type: String, default: null },
  ipad_user: { type: Boolean, default: false }
});

userSchema.path('email').validate(function(value, cb) {
  var context = this;

  mongoose.models.User.findOne({ email: value })
    .then(user => {
      if(!user) {
        cb(true);
      } else if(user && this._id.toString() === user._id.toString()) {
        cb(true);
      } else {
        cb(false);
      }
    });
}, 'Email already exists');

userSchema.pre('save', function(next){
  if (this.isNew){
    this.password = this.generateHash(this.password);
  }

  next();
});

module.exports = userSchema;
