var filters = require('./filters');
var _ = require('lodash')
var oid = require('mongodb').ObjectID
var encryption = require('../utils/encryption')

// match conditions to fbevents here
function matchNotificationRuleToFbevents(notificationRule, fbevents){
	var fbeMap = {}
	fbevents.forEach(fbe => fbeMap[fbe.question_id.toString()] = fbe);
	var matches = {}
	
	notificationRule.conditionSet.forEach(cs => {
		var qid = cs.question_id.toString();
		var fbevent = fbeMap[qid]
		matches[cs.orGroupId || qid] = matches[cs.orGroupId || qid] || false;
		// ^ map all required conditions to matches map. Those in the same all-group share a key and that value only needs to be evaluated true once in order for the rule to pass.
		
		if(fbevent){

			var data = _.get(fbevent, cs.key)
			if(!data) data = _.get(fbevent, cs.key.replace('Map', ''))

			var key = cs.key.split('data').join("").split('Map').join("").split("['").join("").split("']").join("");
			if(fbevent.question_type === 'Contact' || fbevent.question_type === 'Upsell' || fbevent.question_type === 'Slider'){
				var data = _.find(fbevent.data, {id: key})
				data = _.get(data, 'data')
				data = fbevent.question_type === 'Slider' ? data*10 : data
			}

			if(typeof data === 'string' && ['Text', 'Contact', 'Upsell'].indexOf(fbevent.question_type) > -1 && fbevent.crypted === true && process.env.NODE_ENV !== 'test') {
				 data = encryption.decrypt(data);
			}

			var match = matchConditionsToData(cs.conditions, data);
			if(cs.orGroupId) matches[cs.orGroupId] = matches[cs.orGroupId] || match; // evaluates true when first condition is met in orGroup
			else matches[qid] = match
		}

	})
	var rulesLength = _.keys(matches).length;
	var trueMatchesLength = _.keys(matches).filter(key => matches[key] === true).length
	return  rulesLength === trueMatchesLength;
	
}

function matchConditionSetMemberToFbeventWithEqualQuestionId(conditionSetMember, fbevent){
  	// return true or false
  	return conditionSetMember.question_id.toString() == fbevent.question_id.toString();
}

function matchConditionsToData(conditionsObject, data){
  	// return true or false
		if(data === undefined) return false;

  	var andConditions = conditionsObject.and || [];
  	var orConditions = conditionsObject.or || [];
  	var andConditionResult = undefined;
		var orConditionResult = undefined;
		
		andConditions.forEach(and => {
			const matching = matchConditionToData(and, data)
			andConditionResult = andConditionResult != undefined ? andConditionResult && matching : matching;
		})

		orConditions.forEach(or => {
			const matching = matchConditionToData(or, data);
			orConditionResult = orConditionResult === true ? orConditionResult : matching
		})

		var result = undefined;

		result = andConditionResult !== undefined ? andConditionResult : undefined;
		if(orConditionResult !== undefined){
			if(result !== undefined){
				result = result && orConditionResult;
			} else {
				result = orConditionResult;
			}
		}
		result = result === undefined ? false : result;

		return result;
}

function matchConditionToData(condition, data){

	// return true or false
	var fn = condition.fn;
	var value = condition.value;
	var operator = condition.operator;
	if(_.isArray(data) && fn == "equals") fn = "contains" 
	var result = filters[fn](data, value, operator)
	return result
}

module.exports = { matchNotificationRuleToFbevents, matchConditionSetMemberToFbeventWithEqualQuestionId, matchConditionsToData, matchConditionToData }
