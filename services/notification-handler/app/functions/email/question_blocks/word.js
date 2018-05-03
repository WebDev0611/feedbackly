var _ = require('lodash')
module.exports = function(fbevent, question, language){

  const blocks = fbevent.data.map(data_id => {
    const DATA = _.find(question.choices, {id: data_id})
    return `<div style="color:#ffffff; background-color: #2fa5a4; border-radius:3px; padding: 10px; display:inline-block">
      ${DATA.text[language]}
    </div>`
  })

  var html = `
  <div style="text-align: center;">
  <p style="text-align: center;">
        ${blocks}
  </p>
  </div>
  `

  return html

}
