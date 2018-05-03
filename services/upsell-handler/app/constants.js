const questionTypes = {
  NPS: 'NPS',
  Button: 'Button',
  Image: 'Image',
  Contact: 'Contact',
  Upsell: 'Upsell',
  Word: 'Word',
  Text: 'Text',
  Slider: 'Slider'
}

const HERO_TITLE = {
  fi: 'Kiitos palautteestasi ja osallistumisesta kilpailuumme!',
  en: 'Thank you for your feedback and taking part in our prize draw!'
}

const SUBJECT = {
  fi: 'Kiitos!',
  en: 'Thank you!'
}

const imageTag = [`<img class="max-height"  width=""   height="100"  src="`, `" alt="" border="0" style="display: block; color: #000; text-decoration: none; font-family: Helvetica, arial, sans-serif; font-size: 16px;  max-height: 100px !important; width: auto !important; height: auto !important; " />`]


module.exports = {questionTypes, imageTag, HERO_TITLE, SUBJECT}
