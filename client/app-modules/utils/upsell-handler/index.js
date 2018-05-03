var _ = require('lodash')
var request = require('request')

function handle(fbevent){
  if(fbevent.question_type === 'Upsell'){
    var terms = _.get(_.find(fbevent.data, {'id': 'terms'}), 'data');
    var email = _.get(_.find(fbevent.data, {'id': 'email'}), 'data');

    if(terms && email){
      request({
        url: process.env.UPSELL_HANDLER_URL,
        method: 'POST',
        body: fbevent,
        json:true
      }, (err, status, response) => {
        if(err){
          console.log('upsell handler error:')
          console.log(err);
        }
        if(status && status.statusCode === 200){
          console.log('upsell handle success')
        }
      })
    }

  }
}

module.exports = {handle}
