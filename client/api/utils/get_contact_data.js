const _ = require('lodash')
const crypt = require('./crypt');

function getContactData(fb, data, metas){
 

  const returnableObj = {}

  // check contact_ fields
  const contactMetas = metas.filter(meta => meta.key.startsWith('contact_')).forEach(meta => {
    if(meta.val.length > 0){
      const val = crypt.encrypt(meta.val)
      if(meta.key.endsWith('email')) returnableObj.email = val;
      if(meta.key.endsWith('phone')) returnableObj.phone = val;
      if(meta.key.endsWith('custom')) returnableObj.custom = val;
    }
  })


  // check contact form fields

  if(fb.question_type == 'Contact'){
    const contacts = data.filter(d => d.subType === 'email' || d.subType === 'tel');
    contacts.forEach(contact => {
      if(contact.subType == 'email') returnableObj.email = contact.data;
      if(contact.subType == 'tel') returnableObj.phone = contact.data;
    })
  }

  return _.isEmpty(returnableObj) ? false : returnableObj;
}

module.exports = { getContactData }