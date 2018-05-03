var helper = require('sendgrid').mail
var templateIds = require('./template_ids');
var getLogoTemplate = require('./../survey-templates/logo')
var _ = require('lodash')

function createMail(data, customization, addresses){

  // customization contains html and substitutions
  // customization.html, customization.substitutions

  var mail = new helper.Mail();
  var email = new helper.Email(data.fromEmail, data.fromName)
  mail.setFrom(email)
  mail.setSubject(data.subject);

  _.forEach(addresses, a =>{
    var personalization = createPersonalization(a, data, customization.substitutions)
    mail.addPersonalization(personalization);
  })

  if(templateIds.requiresTemplate(data.question)){
    mail.setTemplateId(templateIds.getTemplateId(data.question));
  } else {
    content = new helper.Content("text/html", customization.html);
    mail.addContent(content)
  }

  var json = mail.toJSON();
  //console.log(json)
  return json
}

function createPersonalization(address, data, substitutions){

  if(data.mailinglist_id){
    var unsubscribeLink = `${process.env.DASH_URL}/api/mailinglists/${options.mailingListId}/unsubscribe/${address.email}`;
  }

  var personalization = new helper.Personalization();
  var addressDecrypt = data.isTest ? address : address.toJSON();
  var email = new helper.Email(addressDecrypt.email, `${addressDecrypt.fname} ${addressDecrypt.lname}`)
  personalization.addTo(email)

  //console.log(data)
    var substitution = new helper.Substitution("{{company_logo}}", getLogoTemplate(data.organizationLogoUrl));
    personalization.addSubstitution(substitution);

    // substitute [] manually inside textBody
    let textBody = data.textBody

    // find matches of [abc]
    const matches = data.textBody.match(/\[([^\)]+?)\]/g);
    if(matches && matches.length > 0){
      const replaceThese = matches.map(match => {
        const key = match.split('[').join("").split("]").join("");
        const val = _.get(addressDecrypt, `meta["${key}"]`) || ''
        return {key: match, val}
      })

      replaceThese.forEach(replaceable => {
        textBody = textBody.split(replaceable.key).join(replaceable.val);
        substitution = new helper.Substitution(replaceable.key, replaceable.val);
        personalization.addSubstitution(substitution)
      })
    }

    substitution = new helper.Substitution("{{heading_text}}", textBody);
    personalization.addSubstitution(substitution);


    _.forEach(substitutions, (val, key) => {
      if(key.indexOf("link") > -1){
        if(address.shortid){
          val+= val.indexOf('?') > -1 ? '&' : '?'
          val+= "_z=" + address.shortid;
        }
      }
      personalization.addSubstitution(new helper.Substitution(key, val))
    })
  

  return personalization;
}

module.exports = {createMail}
