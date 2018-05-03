module.exports = function(fbevent, question, language){
  var _ = require('lodash')

var DATA = fbevent.data;
var html = `<div style="text-align: center;"><span style="font-family:tahoma,geneva,sans-serif;"><span style="font-size: 12px;">`

var fields = question.choices;
fields = _.map(fields, f => { f.id = f.id.toString(); return f })

DATA.forEach(d => {
  var field = _.find(fields, {id: d.id})
  var value = d.data*10;
  if(_.get(question,'opts.smallScale')) value = value/2;
  var num = Math.round(value)
  html+=`<p><span style="font-weight:bold">${field.text[language]}</span>: ${num}</p>`
})

html+=`</span></span></div>`


return html

}
