var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var expect = chai.expect;


var client = require('mongodb').MongoClient;
const MONGO_URL = 'mongodb://localhost/feedbackly-test-destructive'
const testData = require('./test-data')
var Promise = require('bluebird');
var Main = require('../app/functions/main');


client.connect(MONGO_URL).then(db => {
  db.dropDatabase().then(() => {
    return Promise.all([
      db.collection("fbevents").insertMany(testData.fbevents),
      db.collection("notificationrules").insertMany(testData.notificationRules)
    ])
  })
  .then(() => {
    describe("the main notification", () => {

        it("should have proper content", () => {
          var promise = Main.handleMessage(testData.fbevents[0]);
          return expect(promise).to.eventually.have.deep.property("data[0]", "Lisää John Flanaganin kirjoja")
        })

        it("should return false to not send a notification", () => {
          var promise = Main.handleMessage(testData.fbevents[testData.fbevents.length-1]);
          return expect(promise).to.eventually.equal(false)
        })

    })
  })
})
