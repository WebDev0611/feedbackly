var sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
var _ = require('lodash');

function sendMail(body) {
  if(process.env.SENDGRID_TEST_MODE) {
      /*body = _.assign({}, body,
        {
          mail_settings: {
            sandbox_mode: {
              enable: true
            }
          }
        }
      );*/
      body.personalizations.forEach( p => {
        var domain = p.to[0].email.match(/@.+$/)[0];
        if(domain != "@feedbackly.com") p.to[0].email = p.to[0].email.replace(/@.+$/,'@sink.sendgrid.net');
      })
    }
    var request = sg.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body
    });



    return new Promise((res,rej) => {
        sg.API(request, (error, response) => {
          if (error) rej(JSON.stringify(error, null, 2));
          else res(response);
        })
    });

}
module.exports = {
  sendMail
};
