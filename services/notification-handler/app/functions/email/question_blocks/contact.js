var encryption = require('../../../utils/encryption')
module.exports = function(fbevent, question, language){
  var _ = require('lodash')

if(fbevent.crypted){
  var DATA = fbevent.data.map(o => { return { id: o.id, data: encryption.decrypt(o.data) }})

} else var DATA = fbevent.data;

var html = `<div style="text-align: center;"><span style="font-family:tahoma,geneva,sans-serif;"><span style="font-size: 12px;">`
var fields = question.choices;

DATA.forEach(d => {
  var field = _.find(fields, {id: d.id})
  html+=`<p><span style="font-weight:bold">${field.text[language]}</span>: ${d.data}</p>`
})

html+=`</span></span></div>`


return html

}
