'use strict';

var auth = require('../lib/auth');
var render = require('../lib/render');
var fs = require('fs');
var s3Client = require('../lib/s3-client');
var objectId = require('bson-objectid');
var _ = require('lodash');
var sharp = require('sharp')
var fsRename = require('bluebird').promisify(require("fs").rename);

module.exports = function (app) {
	app.post('/upload',
		auth.isLoggedIn(),
		async (req, res) => {
			var tmp_path = _.get(req, 'files.file.path') || '';

			var extension = tmp_path.lastIndexOf('.') >= 0
				? `.${tmp_path.substr(tmp_path.lastIndexOf('.') + 1)}`
				: '';

			var org_id = req.user.activeOrganizationId();
			var new_name = `${objectId().toHexString()}${extension}`;
			var target_path = `${process.cwd()}/public/uploads/${new_name}`;
			var image_url = `uploads/${new_name}`;

			try {
				if (req.headers['Image-Type'] == 'logo') {
					await sharp(tmp_path)
						.resize(null, 200)
						.withoutEnlargement(true)
						.toFile(target_path)
				} else {
					await sharp(tmp_path)
						.resize(null, 600)
						.withoutEnlargement(true)
						.toFile(target_path);
				}
			} catch (e) {
				console.error(e)
				res.setStatus(500).send({ error: 'Error handling file.' })
			}

			s3Client.uploadToAmazon(target_path, image_url, function (response) {
				// error handling missing
				render.api(res, null, { status: response, file: response });
				fs.unlink(tmp_path, () => { })
			});
		});
}
