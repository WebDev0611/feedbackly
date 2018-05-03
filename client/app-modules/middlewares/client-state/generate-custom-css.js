/*eslint-disable*/
var _ = require('lodash');
const imageCacheAsync = require('./image-cache-async');

var generateCustomCSS = async function(styles){
  if(styles == undefined || styles == null || styles.enabled == false) return '';
  try{
  var Color = require('color');
  var light = Color(styles.backgroundColor).light() // is bg light or dark?
  var boxShadow = Color(styles.backgroundColor).darken(0.4).fade(0.6)

  var logoColor = light ? 'black' : 'white';
  var logoOpacity = light ? '0.2' : '0.6';
  var progressBarBaseColor = Color(styles.backgroundColor).darken(0.2)

  var cssString = "";
  let logoSource = `https://survey.feedbackly.com/dist/images/logos/feedbackly-logo-${logoColor}.png`;
  let logo;
  try{
    logo = await imageCacheAsync.fetch(`https://survey.feedbackly.com/dist/images/logos/feedbackly-logo-${logoColor}.png`)
  }catch(e){}

  logoSource = (logo ? logo.data : logoSource).replace(' charset=UTF-8;', '');


  cssString+=`
    h1,h2,h3,h4,h5,h6{
      font-family: ${styles.headingFont};
      font-style: ${styles.headingFont === 'Merriweather' ? 'italic' : 'normal'};
      font-weight: 400;
      letter-spacing: 0;
      color: ${styles.headingColor};
    }

    .question-wrapper .question-header h3{
      color: ${styles.textColor};
    }

    body, .plugin-decorator.popup-decorator, body.plugin-view{
      background-color: ${styles.backgroundColor};
      background-image: none;
      color: ${styles.textColor};
    }

    #root > div {
      color: ${styles.textColor};
    }

    .progress-bar{
      background-color: ${progressBarBaseColor};
    }

    .progress-bar .progress {
      box-shadow: 0px 0px 10px ${styles.headingColor};
      background-color: ${styles.headingColor};
    }

    .word-question-wrapper .word-wrapper .btn-word, .btn, .horizontal-form-wrapper .horizontal-form-item .horizontal-form-item-direction, .nps-question-wrapper .nps-button {
        background-color: ${styles.buttonBGColor};
        color: ${styles.buttonTextColor};
    }

    .word-question-wrapper .word-wrapper .btn-word:active, .btn:active{
      background-color: ${Color(styles.buttonBGColor).darken(0.15)};
    }

    .word-question-wrapper .word-wrapper .btn-word.highlight-on-active.tap-active,
    .word-question-wrapper .word-wrapper .btn-word.highlight-on-active.tap-active:active {
      background-color: ${Color(styles.buttonBGColor).darken(0.15)};
    }

    .privacy-policy-toggle, #survey-header #survey-header-translations button{
      color: ${styles.textColor};
    }

    .question-wrapper .heading-divider:after{
      background-color: ${styles.textColor};
    }

    .face-image-wrapper div{
      border-radius: 100%;
      box-shadow: 0 0 7px 1px ${boxShadow};
    }

    #survey-header #survey-header-feedbackly-logo {
      background-image: url(${logoSource});
      opacity: ${logoOpacity};
      background-size: contain;
      background-repeat: no-repeat;
    }

    .face-label {
      -webkit-text-stroke-width: 1px;
      -webkit-text-stroke-color: ${Color(boxShadow).darken(0.1)};
    }

    .checkbox-container .checkbox-wrapper .checkbox-indicator {
      background-color: ${styles.headingColor};
    }

  ` } catch(e){ console.log(e); return ''}
  return cssString
}
module.exports={generateCustomCSS};
