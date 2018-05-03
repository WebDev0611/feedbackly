var _ = require('lodash')

function getFeedbackData(row, headers){
  var html = ""
  headers.forEach(header => {
    if(['Date', 'Time', 'Channel', '_id'].indexOf(header.key) > -1) return;
    var target = row[header.key];
    if(target != undefined){

      if(header.type == 'Button') html+=createButtonRow(target)
      else if(header.type == 'NPS') html+=createNPSRow(target)
      else if(header.type == 'Word') html+=createWordRow(target)
      else if(header.type == 'Image') html+=createImageRow(target)
      else if(header.type == 'Contact') ;//
      else if(header.type == 'Slider') ;//
      else if(header.type == 'Text') ;//
      else if(header.type == 'Upsell') ;//


      else html+=target;
    }
  })
  return html;
}


function createButtonRow(target){
  return `<div class="button"><img src="${target}" /></div>`
}

function createNPSRow(target){
  return `<div class="nps">${target}</div>`
}

function createWordRow(target){
  return `<div class="word">${target}</div>`
}

function createImageRow(target){
  return `<div class="image"><img src="${target.url}" />${target.label}</div>`
}



module.exports = {getFeedbackData}
