var client = require('mongodb').MongoClient;
const MONGO_URL = 'mongodb://localhost/noti'
const testData = require('./index.js')
var Promise = require('bluebird');

client.connect(MONGO_URL).then(db => {
  return Promise.all([
    db.collection("fbevents").insertMany(testData.fbevents),
    db.collection("notificationrules").insertMany(testData.notificationRules)
  ])
})
.then(() => console.log('Database seed done. You can exit now.'))
.catch(e => console.log(e));
