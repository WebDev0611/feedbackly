var mongoose = require('mongoose');

var organizationRightSchema = mongoose.Schema({
  organization_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Organization' },
  user_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  rights: {
    survey_create: { type: Boolean, required: true, default: false },
    devicegroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Devicegroup' }],
    enable_feedback_inbox_for_user: {type: Boolean, default: false},
    inbox_settings: {
      hide_full_profiles: {type: Boolean, default: false},
      user_groups: [{type: mongoose.Schema.Types.ObjectId}],
      mode: {type: String, default: 'all'}
    }
  }
});

organizationRightSchema.statics.updateUsersRights = function(userId, organizationId, rights) {
  return this.update({ user_id: userId, organization_id: organizationId }, { $set: { rights } }, { upsert: true, runValidators: true });
}

module.exports = mongoose.model('Organizationright', organizationRightSchema);
