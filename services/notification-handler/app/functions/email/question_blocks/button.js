var buttonImages = require('../../../../lib/button_images')
var _ = require('lodash')

module.exports = function(fbevent, question, language){

var STYLE = _.get(question, 'opts.buttonStyle') || {}
var DATA = fbevent.data[0];

var html = `
<div style="text-align: center;">
<p style="text-align: center;"><span class="sg-image" style="float: none; display: block; text-align: center;">
<img src="${buttonImages.getUrl(STYLE, DATA)}" style="width: 55px; height: 55px;" height="55" width="55"></span></p>
</div>
`

return html

}
