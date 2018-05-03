var crypto = require('crypto');
var algorithm = 'aes-256-ctr';
var _ = require('lodash')
function encrypt (text) {
		var cipher = crypto.createCipher(algorithm, process.env.CRYPTO_SECRET)
		var crypted = cipher.update(text,'utf8','hex')
		crypted += cipher.final('hex');
		return crypted;
}
function decrypt(text) {
		var decipher = crypto.createDecipher(algorithm, process.env.CRYPTO_SECRET)
		var dec = decipher.update(text,'hex','utf8')
		dec += decipher.final('utf8');
		return dec;
}

module.exports = {
	encrypt,
	decrypt,

	decryptFeedback: function(feedback){
		  var dontDecrypt = _.filter(feedback.data, q => ['Contact', 'Text'].indexOf(q.question_type) == -1)
			var willDecrypt = _.filter(feedback.data, q => ['Contact', 'Text'].indexOf(q.question_type) > -1)

			var decrypted = willDecrypt.map(e => {
				if(e.question_type == 'Text' && e.crypted == true){
					var returnable = Object.assign({}, e, {value: decrypt(e.value)})
					return returnable
				}else if(e.question_type == 'Contact'){
					var values = [...e.value].map(v => Object.assign({}, v, {data: decrypt(v.data)}))
					return Object.assign({}, e, {value: values})
				} else return e
			})

			var decryption = Object.assign({}, feedback, {data: [...dontDecrypt, ...decrypted]})
			return decryption

	}
}
