var mongoose = require('mongoose');

var schema = mongoose.Schema({
    device_id: { type: mongoose.Schema.Types.ObjectId },
    placement: { type: String },
    display: { type: String },
    show_after_seconds_on_page: { type: Number },
    show_after_seconds_on_site: { type: Number },
    hidden_after_closed_for_hours: { type: Number },
    hidden_after_feedback_for_hours: { type: Number },
    url_patterns: { type: [String] }
});

require('./methods')(schema);

module.exports = mongoose.model('Pluginsettings', schema);
