// ALL RETURN A BOOLEAN

var _ = require('lodash')

function contains(dataFromMessage, dataFromRule){
  return containsFunction(dataFromMessage, dataFromRule, 'all')  
}

function containsOne(dataFromMessage, dataFromRule){
  return containsFunction(dataFromMessage, dataFromRule, 'any')
}

function containsFunction(dataFromMessage, dataFromRule, allOrOne){ /// contains ALL (dataFromMessage contains all in dataFromRule) 
  	// return true or false
    var data = typeof dataFromMessage == 'number' ? dataFromMessage.toString() : dataFromMessage;
    if(typeof data == 'string') data = data.toUpperCase()

    const dataFromRuleArray = _.isArray(dataFromRule) ? dataFromRule : [dataFromRule];

    const method = allOrOne == 'all' ? 'min' : 'max'

    const allRulesMatchAtLeastOneData = Math[method](...dataFromRuleArray.map(ruleItem => {
      const ITEM = typeof ruleItem == 'string' ? ruleItem.toUpperCase() : ruleItem;
      const feedbackDataArray = _.isArray(data) ? data : [data];      
      const anyDataMatchesRule = Math.max(...feedbackDataArray.map(dataItem => {
        if(typeof dataItem == 'number') return dataItem == ITEM ? 1 : 0
        if(typeof dataItem == 'string') dataItem = dataItem.toUpperCase()
        return dataItem.indexOf(ITEM) > -1 ? 1 : 0
      })) // returns 1 if any of the data matches the rule
      return anyDataMatchesRule
    })) === 1 
    // returns true if all rules match at least one data (Math.min)
    // returns true if at least one rule matches at least one data (Math.max)

    return allRulesMatchAtLeastOneData;  
}

function length(dataFromMessage, dataFromRule, operator){
    // TODO: security risk
    // return true or false
  	return eval(dataFromMessage.length + operator + dataFromRule);
}

function equals(dataFromMessage, dataFromRule){
    if(dataFromMessage === 'true' && dataFromRule) return true;
    if(dataFromMessage === 'false' && !dataFromRule) return true;
  	return dataFromMessage === dataFromRule
}

// yet to be implemented
function isGreaterOrLess(dataFromMessage, dataFromRule){
  if(typeof dataFromMessage == 'number'){
    return eval(dataFromMessage + dataFromRule)
  } else return undefined
}




module.exports = {contains, containsOne, length, equals, isGreaterOrLess}
