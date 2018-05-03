var _ = require('lodash')
var chai = require("chai");
var expect = chai.expect;
const testData = require('./test-data')
var conditionsMatch = require('../app/functions/conditions_match');


    describe("ConditionsMatch", () => {
      describe("fbevents match conditions", () => {

        var fbevents = _.filter(testData.fbevents, {feedback_id: "5838737b55025b7da9d2d933"});
        var fbevents2 = _.filter(testData.fbevents, {feedback_id: "582df08d01b480278bf9644f"});
        var rule1 = _.find(testData.notificationRules, {_id: "1"})
        var rule2 = _.find(testData.notificationRules, {_id: "2"})
        var rule4 = _.find(testData.notificationRules, {_id: "4"})

        var matchNotificationRuleToFbevents= conditionsMatch.matchNotificationRuleToFbevents;
        var matchConditionSetMemberToFbeventWithEqualQuestionId = conditionsMatch.matchConditionSetMemberToFbeventWithEqualQuestionId
        var matchConditionsToData = conditionsMatch.matchConditionsToData
        var matchConditionToData = conditionsMatch.matchConditionToData

        describe("matchConditionToData", () => {

          it("should match a condition with data", () => {
              var result = matchConditionToData({fn: "length", operator: ">", value: "3"}, "Hello world");
              expect(result).to.equal(true);
          })

          it("should not match a condition with data", () => {
              var result = matchConditionToData({fn: "contains", value: "not in string"}, "Hello world");
              expect(result).to.equal(false);
          })

        })

        describe("matchConditionsToData", () => {
          it("should match all conditions with data", () => {
              var result = matchConditionsToData(
                {
                  and: [{fn: "length", operator: ">", value: "10"}, {fn: 'contains', value: "John"}],
                  or: [{fn: "contains", value: "Williams" }, {fn: "contains", value: "Travolta" }]
                }
                , "John Williams is a great composer.");
              expect(result).to.equal(true);
          })

          it("should not match some conditions with data", () => {
              var result = matchConditionsToData(
                {
                  and: [{fn: "length", value: ">10"}, {fn: 'contains', value: "John"}],
                  or: [{fn: "contains", value: "Williams" }, {fn: "contains", value: "Travolta" }]
                }
                , "John is a great composer.");
              expect(result).to.equal(false);
          })
        })


        describe("matchConditionSetMemberToFbeventWithEqualQuestionId", () => {
          it("should match a condition set member with an fbevent", () => {
            var setMember = rule1.conditionSet[0];
            var fbevent = _.find(testData.fbevents, {_id:"583873a055025b7da9d2d936"});
            var result = matchConditionSetMemberToFbeventWithEqualQuestionId(setMember, fbevent);
            expect(result).to.equal(true);
          })

          it("should not match a condition set member with an fbevent", () => {
            var setMember =  _.find(testData.notificationRules, {_id: "3"}).conditionSet[0]
            var fbevent = _.find(testData.fbevents, {_id:"583873a855025b7da9d2d937"});

            var result = matchConditionSetMemberToFbeventWithEqualQuestionId(setMember, fbevent);
            expect(result).to.equal(false);
          })

        })


        describe("matchNotificationRuleToFbevents", () => {

        it("fbevents with feedback_id 5838737b55025b7da9d2d933 should match rule 1", () => {
          var result = matchNotificationRuleToFbevents(rule1, fbevents);
          expect(result).to.equal(true)
        })

        it("fbevents with feedback_id 5838737b55025b7da9d2d933 should match rule 2", () => {
          var result = matchNotificationRuleToFbevents(rule2, fbevents);
          expect(result).to.equal(true)
        })

        it("fbevents with feedback_id 582df08d01b480278bf9644f should not match rule 1", () => {
          var result = matchNotificationRuleToFbevents(rule1, fbevents2);
          expect(result).to.equal(false)
        })

        it("fbevents with feedback_id 582df08d01b480278bf9644f should not match rule 2", () => {
          var result = matchNotificationRuleToFbevents(rule2, fbevents2);
          expect(result).to.equal(false)
        })

        it("fbevents with feedback_id 5838737b55025b7da9d2d933 should match rule 4", () => {
          var result = matchNotificationRuleToFbevents(rule4, fbevents);
          expect(result).to.equal(true)
        })
      });



      })



    })
