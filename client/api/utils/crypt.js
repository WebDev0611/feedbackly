var crypto = require('crypto');

var algorithm = 'aes-256-ctr';

function encrypt(text) {
  var cipher = crypto.createCipher(algorithm, process.env.CRYPTO_SECRET);
  var cryptedText = cipher.update(text.toString() ,'utf8', 'hex');

  return cryptedText + cipher.final('hex');
}

module.exports = { encrypt };
