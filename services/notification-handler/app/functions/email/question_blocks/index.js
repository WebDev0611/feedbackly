const _ = require('lodash');
const Button = require('./button')
const Word = require('./word')
const Image = require('./image')
const Contact = require('./contact')
const Text = require('./text')
const NPS = require('./nps')
const Slider = require('./slider')
const Upsell = require('./upsell')

function build(question, fbevent){
  let language = null;
  if(fbevent.language in question.heading) language = fbevent.language;
  else if('en' in question.heading) language = 'en';
  else language = _.keys(question.heading)[0];
  const TITLE = question.heading[language];

  var html = `<table class="module" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;"><tr><td style="padding: 10px 10px 20px 10px;" bgcolor="#ffffff"><div> `
  html+=`<div style="text-align: center;"><span style="font-size:16px;"><span style="color: rgb(105, 105, 105);"><span style="font-family: verdana,geneva,sans-serif;">${TITLE}</span></span></span></div>`
  html+=`<p style="text-align: center;">&nbsp;</p>`

  // title
  // subtitle ?

  if(question.question_type === 'Button') html+=Button(fbevent, question, language)
  if(question.question_type === 'Word') html+=Word(fbevent, question, language)
  if(question.question_type === 'Image') html+=Image(fbevent, question, language)
  if(question.question_type === 'Contact') html+=Contact(fbevent, question, language)
  if(question.question_type === 'Text') html+=Text(fbevent, question, language)
  if(question.question_type === 'NPS') html+=NPS(fbevent, question, language)
  if(question.question_type === 'Slider') html+=Slider(fbevent, question, language)
  if(question.question_type === 'Upsell') html+=Upsell(fbevent, question, language)

  html +=`</div> </td></tr></table>`

  return html
}

module.exports = {build}
