var _ = require('lodash')
var request = require('request')

function handle(fbevent){
  console.log('handling notification')
  if (fbevent.question_type === 'Text' && fbevent.filtered === true) return; 
  
  request({
    url: process.env.NOTIFICATION_HANDLER_URL,
    method: 'POST',
    body: fbevent,
    json:true
  }, (err, status, response) => {
    if(err) {
      console.log('notification handler error:')
      console.log(err);
    }
    if(status && status.statusCode === 200){
      console.log('notification handle success')
    }
  })
}
module.exports = { handle }