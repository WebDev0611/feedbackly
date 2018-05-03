var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var expect = chai.expect;
var client = require('mongodb').MongoClient;
const MONGO_URL = 'mongodb://localhost/feedbackly-test-destructive'

var dbOperations = require('../app/functions/db_operations');

client.connect(MONGO_URL).then(db => {
    
  describe("Send Notification", () => {
    describe("Notification already sent check mongo", () => {

      it("should return true for a sent notification", () => {
        dbOperations.updateAsSent("5877c26c8352d233b0fecbde", "575572a7f39049e6001f1c07", db)
        .then(() => {
            var promise = dbOperations.alreadySent("5877c26c8352d233b0fecbde", "575572a7f39049e6001f1c07", db)
            return expect(promise).to.eventually.equal(true);
        })
      })

      it("it should return false for an unsent notification", () => {
            var promise = dbOperations.alreadySent("575572a7f39049e6001f1c07", "5877c26c8352d233b0fecbde", db)
            return expect(promise).to.eventually.equal(false);
      })
    })
  })
})