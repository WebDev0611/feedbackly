var Promise = require('bluebird');
var sg = require('sendgrid')(process.env.SENDGRID_API_KEY);


function send(mail){
  return new Promise((resolve, reject) => {
    var request = sg.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: mail,
    });

    sg.API(request, function(error, response) {
      console.log(response.statusCode);
      console.log(response.body);
      console.log(response.headers);

      if(error) reject(error)
      else resolve(true)
    });

  })
}

module.exports = send
