const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function send(mails){

  if(process.env.DOCKER_ENV == 'production'){
    return sgMail.send(mails);    
  
  } else {
    return sgMail.send(mails);    
    
    console.log(JSON.stringify(mails, null, 2))
    return Promise.resolve()
  }
}


module.exports = send
