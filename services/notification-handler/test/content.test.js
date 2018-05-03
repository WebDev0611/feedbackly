var _ = require('lodash')
var chai = require("chai");
var expect = chai.expect;
const testData = require('./test-data')
var content = require('../app/functions/content');

var fbevents = _.filter(testData.fbevents, {feedback_id: "5838737b55025b7da9d2d933"});

it("should give contentObject from matched fbevents", () => {

  var result = content.getAllContentFromMatchedFbevents(_.find(testData.notificationRules, {_id: "2"}), fbevents);
  var fbevent = _.find(testData.fbevents, {_id: "5838737b55025b7da9d2d934"})
  expect(result.data).to.include(fbevent)
})

it("should give dataObject from matched fbevent", () => {

  var result = content.getContentFromMatchedFbevents("5757bb0e66752be500d5c2a3", fbevents);
  var fbevent = _.find(testData.fbevents, {_id: "583873a055025b7da9d2d936"})
  expect(result).to.include(fbevent)
})
