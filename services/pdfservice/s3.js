var s3 = require('s3');
var Promise = require('bluebird');

var client = s3.createClient({
	maxAsyncS3: 20,     // this is the default
	s3RetryCount: 3,    // this is the default
	s3RetryDelay: 1000, // this is the default
	multipartUploadThreshold: 209715200, // this is the default (20 MB)
	multipartUploadSize: 157286400, // this is the default (15 MB)
	s3Options: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET,
    region: process.env.S3_REGION
	}
});

function uploadToAmazon(file, image_url, callback){
	var params = {
		localFile: file,
		s3Params: {
        Bucket: process.env.S3_BUCKET,
        Key: image_url
		}
	};

	var uploader = client.uploadFile(params);

	uploader.on('error', function(err) {
    callback(err);
	});

	uploader.on('end', function() {
  	callback(s3.getPublicUrl(params.s3Params.Bucket, params.s3Params.Key, process.env.S3_REGION));
	});
};

function uploadToAmazonPromise(file, image_url){
	return new Promise((resolve, reject) => {
			var params = {
				localFile: file,
				s3Params: {
						Bucket: process.env.S3_BUCKET,
						Key: image_url
				}
			};

			var uploader = client.uploadFile(params);

			uploader.on('error', function(err) {
				reject(err);
			});

			uploader.on('end', function() {
				resolve(s3.getPublicUrl(params.s3Params.Bucket, params.s3Params.Key, process.env.S3_REGION));
			});

		})
	}

module.exports = {uploadToAmazon, uploadToAmazonPromise}
