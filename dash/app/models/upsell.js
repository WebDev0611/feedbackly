// app/models/upsell.js

var mongoose = require('mongoose');

var upsellSchema = mongoose.Schema(
	{
      name: {type: String, required: true},
      code: {type: String},
      barcode: mongoose.Schema.Types.Mixed,
      heading: {type: String, required: true},
      subtitle: String,
      text: {type: String, required: true},
			organization_id: mongoose.Schema.Types.ObjectId,
			created_by: mongoose.Schema.Types.ObjectId,
			image_url: String
		}
);

// methods ======================



module.exports = mongoose.model('Upsell', upsellSchema);
