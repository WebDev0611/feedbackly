var _ = require('lodash')

module.exports = function(fbevent, question, language){

var data_id = fbevent.data[0];

var DATA = _.find(question.choices, {id: data_id})
if(!DATA) return '';

var html = `
<div style="text-align: center;">
<p style="text-align: center;"><span class="sg-image" style="float: none; display: block; text-align: center;">
<img src="${DATA.url}" style="width: 60px; height: 60px;" height="60" width="60"></span>
${DATA.text[language]}
</p>
</div>
`

return html

}
