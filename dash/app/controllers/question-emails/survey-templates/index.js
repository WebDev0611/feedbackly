var _ = require('lodash')
var ejs = require('ejs')
var path = require('path')
var fs = require('fs')

var getSurveyUrl = function(linkToSurvey, question, value){
  var link = linkToSurvey;
  if(value){
    var val = value;
    if(question.question_type === 'Button'){
      val = value.split("")
      val.splice(1, 0 , ".");
      val = val.join("")
    }
    link+= `&qid=${question._id}&val=${val}`
  }
  return link;
}

function getTemplate() {

  var templatePath = path.join(__dirname, 'components', 'template.ejs');

  return fs.readFileAsync(templatePath, 'utf-8')
    .then(content => {
      return ejs.compile(content, { cache: true, filename: templatePath });
    });
}

var getQuestionData = function(opts){
  var question = opts.question, link = opts.linkToSurvey, language = opts.language;

  return new Promise((resolve, reject) => {

    var substitutions = {
      "{{question_title}}": question.heading[language]|| '',
      "{{question_subtitle}}": question.subtitle[language] || ''
    }

    var question_type = question.question_type;

    if(question_type == "Button"){
     _.forEach(question.choices, (choice, idx) => {
       var choicesMap = question.choices.length === 4 ? ['000', '033', '066', '100']
        : ['000', '025', '050', '075', '100']

       substitutions = _.assign(substitutions,{
         [`{{data_${choicesMap[idx]}}}`]: (choice.text[language] || "").toUpperCase(),
         [`{{data_${choicesMap[idx]}_link}}`]: getSurveyUrl(link, question, choicesMap[idx]),
         [`{{data_${choicesMap[idx]}_link_uriencoded}}`]: encodeURIComponent(`"${getSurveyUrl(link, question, choicesMap[idx])}"`)
       })
     })
     return resolve({substitutions});
    }

    if(question_type === "Contact" || question_type === "Text"){
      substitutions = _.assign(substitutions,{
       '{{survey_link}}': getSurveyUrl(link, question)
     })
     return resolve({substitutions});
    }

    if(question_type === 'Image'){
      var data = [];
      _.forEach(question.choices, (choice, index) =>{
        data.push({
          image_url: choice.url,
          link: getSurveyUrl(link, question, choice.id),
          label: choice.text[language]
        });

        substitutions = _.assign(substitutions,{
          [`{{link_${index}}}`]: getSurveyUrl(link, question, choice.id)
        })
        
      })

      getTemplate().then(template => {
        return template({question_type, data, _, opts})
      })
      .then(html => {
          resolve({html, substitutions})
      })
    }

    if(question_type == "NPS"){
     _.forEach(_.range(0,11), number => {
       substitutions = _.assign(substitutions,{
         [`{{link_${number}}}`]: getSurveyUrl(link, question, number/10)
       })
       substitutions = _.assign(substitutions,{
         [`{{link_${number}_uriencoded}}`]: encodeURIComponent(`"${getSurveyUrl(link, question, number/10)}"`)
       })
     })
     return resolve({substitutions});
    }

    if(question_type === 'Slider'){
      var data = [];
      _.forEach(question.choices, (choice, index) =>{
        data.push({
          link: getSurveyUrl(link, question),
          label: choice.text[language],
          image_url: "https://marketing-image-production.s3.amazonaws.com/uploads/7d76760cd3209d973d3408ff2249bb7c9491e53ab03d4271f332f682ac039157335b9e0eb6adb4f4311a92d49760122c2bc9d2fc6dc5eb62a906d88f8b450b34.png"
        })
        substitutions = _.assign(substitutions,{
          [`{{link_${index}}}`]: getSurveyUrl(link, question)
        })
      })

      getTemplate().then(template => {
        return template({question_type, data, _, opts})
      })
      .then(html => {
          return resolve({html, substitutions})
      })
    }


    if(question_type === 'Word'){
      var data = [];
      _.forEach(question.choices, (choice, index) =>{
        data.push({
          link: getSurveyUrl(link, question, choice.id),
          label: choice.text[language]
        })
        substitutions = _.assign(substitutions,{
          [`{{link_${index}}}`]: getSurveyUrl(link, question, choice.id)
        })
      })

      getTemplate().then(template => {
        return template({question_type, data, _, opts})
      })
      .then(html => {
          return resolve({html, substitutions})
      })
    }


  });
}


module.exports = {getQuestionData}
