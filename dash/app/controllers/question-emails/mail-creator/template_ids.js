var templates = {
  'Button_4': '209ed5ea-0ff9-4d4b-8b8c-69dfff1fd519',
  'Button_5': '6926d533-0ac8-4eeb-8816-23d96aa967e3',
  'NPS':'439b77e1-f36e-4831-9e74-ddcd6065b9b8',
  'Contact': '5d4abe13-0cc8-41d4-962e-0d36ef7d1e56',
  'Text': '5d4abe13-0cc8-41d4-962e-0d36ef7d1e56',
}

function getTemplateId(question){
  if(question.question_type == 'Button'){
    return templates[`Button_${question.choices.length}`];
  }
  else return templates[question.question_type];
}

function requiresTemplate(question){
   return getTemplateId(question) !== undefined
}

module.exports = {getTemplateId, requiresTemplate}
