const profanityFilter = require('./app-modules/middlewares/profanity-filter/function');
const mongoose = require('mongoose');
const fs = require('fs');
var crypto = require('crypto');
var algorithm = 'aes-256-ctr';
const CRYPTO_KEY = '' // add this (don't commit)

function decrypt(text) {
		var decipher = crypto.createDecipher(algorithm, CRYPTO_KEY)
		var dec = decipher.update(text,'hex','utf8')
		dec += decipher.final('utf8');
		return dec;
}

var mongooseOptions = process.env.DB_SSL === 'true' || process.env.DB_SSL === true ? { server: { ssl: true, sslValidate: false } } : {};
mongoose.connect('mongodb://localhost/feedbackly-test', mongooseOptions, () => {

  const cursor = mongoose.connection.db.collection('fbevents').find({organization_id: mongoose.Types.ObjectId("5739da94ac291ee900310eea"), question_type: 'Text'}).stream()
  var wstreamPositives = fs.createWriteStream('rudes.txt');
  var wstreamNegatives = fs.createWriteStream('nopes.txt');
  
  cursor.on("data", fbe => {
    cursor.pause()
    fbe.profanityFilter = true;
    const str = decrypt(fbe.data[0])
    let profanityPass;
    if(fbe.data && fbe.data[0]){
      fbe.data[0] = str.split('\n').join("");
      profanityPass = profanityFilter(fbe)
    }
    if(profanityPass) wstreamPositives.write(fbe.data[0] + '\n')
    else wstreamNegatives.write(fbe.data[0] + '\n')
    cursor.resume()
  })


  cursor.on("end", () => {
    wstream.end();    
    console.log('end');
    process.exit(0)
  })
})