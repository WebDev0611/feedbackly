var crypto = require('crypto');
var algorithm = 'aes-256-ctr';
var CRYPTO_SECRET = process.env.CRYPTO_SECRET;

module.exports = {
	encrypt: function (text) {
		  var cipher = crypto.createCipher(algorithm, CRYPTO_SECRET)
		  var crypted = cipher.update(text,'utf8','hex')
		  crypted += cipher.final('hex');
		  return crypted;
	},
	decrypt: function (text) {
		  var decipher = crypto.createDecipher(algorithm, CRYPTO_SECRET)
		  var dec = decipher.update(text,'hex','utf8')
		  dec += decipher.final('utf8');
		  return dec;
	}
}
