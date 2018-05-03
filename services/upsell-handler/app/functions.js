const helper = require('sendgrid').mail
const _ = require('lodash')
const constants = require('./constants')

const qt = constants.questionTypes;
const imageTag = constants.imageTag;
const SUBJECT = constants.SUBJECT;
const HERO_TITLE = constants.HERO_TITLE;

function getUpsellsFromDevice(device){
  console.log(device)
  return _.get(device, 'upsells') || {}
}


function calculateAverageOfFbevents(fbevents){
  var btnOrNPS = _.filter(fbevents, fbe => ([qt.Button, qt.NPS].indexOf(fbe.question_type) >-1))
  var values = _.map(btnOrNPS, 'data[0]');
  var sliders = _.filter(fbevents, fbe => (fbe.question_type === qt.Slider))
  _.forEach(sliders, s => {
    values = [...values, ..._.map(s.data, 'data')]
  })
  var sum = _.sum(values);

  if(values.length > 0) {
    return Math.round(sum/values.length * 100) / 100
  } else return null;
}


function getUpsellByAverage(upsells, average){

  var returnable = null;

  if(_.isNumber(average)){

    if(average > 0.5){
      var pos = _.get(upsells, 'positive');
      returnable = pos ? pos : returnable;
    }

    if(average < 0.5){
      var neg = _.get(upsells, 'negative');
      returnable = neg ? neg : returnable;
    }

  }

  if(returnable === null){
    var neutral = _.get(upsells, 'neutral');
    returnable = neutral ? neutral : returnable;
  }

  return returnable;
}

function barcodeImageTagBuilder(code, type, showText){
  var host = process.env.BARCODE_GENERATOR_URL || "https://barcode.feedbackly.com"
  var url = `${host}/?bcid=${type}&text=${code}&${showText ? 'includetext' : ''}`
  var tag = imageTag[0] + url + imageTag[1]
  return tag;
}

function buildEmailFromUpsell(upsell, emails, language){

   var mail = new helper.Mail()
   var from = new helper.Email("noreply@feedbackly.com", "Feedbackly")
   mail.setFrom(from)

   var personalization = new helper.Personalization()

   var subject = SUBJECT[language] || SUBJECT.en;
   var heroTitle = HERO_TITLE[language] || HERO_TITLE.en;

   mail.setSubject(subject)
   var substitution = new helper.Substitution('{{hero_title}}', heroTitle);
   personalization.addSubstitution(substitution)

   _.forEach(emails, email => {
     var to = new helper.Email(email, email)
     personalization.addTo(to)
   })


   _.forEach(['heading', 'subtitle', 'text', 'image_url'], t => {
     var substitution = new helper.Substitution(`{{${t}}}`, upsell[t]);
     personalization.addSubstitution(substitution)
   })

   if(upsell.barcode){
     var img = barcodeImageTagBuilder(upsell.code, upsell.barcode.type, upsell.barcode.showText);
   }

   var substitution = new helper.Substitution('{{barcode_image}}', img || '')
   personalization.addSubstitution(substitution)
   mail.addPersonalization(personalization)
   mail.setTemplateId(process.env.SENDGRID_TEMPLATE_ID)

   return mail.toJSON()
}

module.exports = {
  getUpsellsFromDevice,
  calculateAverageOfFbevents,
  getUpsellByAverage,
  buildEmailFromUpsell
}
