var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var expect = chai.expect;

var client = require('mongodb').MongoClient;
const MONGO_URL = 'mongodb://localhost/feedbackly-test-destructive'
const testData = require('./test-data')
var Promise = require('bluebird');
var dbOperations = require('../app/functions/db_operations');



client.connect(MONGO_URL).then(db => {
  db.dropDatabase()
  .then(resultss => {
    console.log(resultss)
    return Promise.all([
      db.collection("fbevents").insertMany(testData.fbevents),
      db.collection("notificationrules").insertMany(testData.notificationRules)
    ])
  })
  .then(() => {

    describe("Database operations", () => {
      describe("getFbeventsByFeedbackId", () => {
        var getFbevents = dbOperations.getFbeventsByFeedbackId;

        it("should have lengthOf 4", () => {
          return expect(getFbevents('5838737b55025b7da9d2d933')).to.eventually.have.lengthOf(4);
        })

      })

      describe("getNotificationRules", () => {
        var getNotificationRules = dbOperations.getNotificationRules;

        it("should have lengthOf 2", () => {
          return expect(getNotificationRules('575572a7f39049e6001f1c07')).to.eventually.have.lengthOf(2);
        })

      })

    })

  })
  .catch(err => console.log(err))




})
.catch(err => console.log(err))
