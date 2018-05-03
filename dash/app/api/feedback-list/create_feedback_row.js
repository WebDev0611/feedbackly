var _ = require('lodash')
var oid = require('mongoose').Types.ObjectId;
var moment = require('moment')
var encryption = require('../../lib/encryption')

function createRow(feedback, headers, devices, format){
  var row = {}
  headers.forEach(column => {

    if(column.key === '_id'){
      row[column.key] = feedback._id.toString();
    }
    else if(column.key === 'Date'){
      row[column.key] = moment.utc(feedback.created_at_adjusted_ts*1000).format('DD.MM.YYYY')
    }

    else if(column.key === 'Time'){
      row[column.key] = moment.utc(feedback.created_at_adjusted_ts*1000).format('HH:mm')
    }

    else if(column.key === 'Channel'){
      row[column.key] = _.get(_.find(devices, {_id: feedback.device_id}), 'name')
    }

    else if(column.key === 'Browser'){
       var browser = _.get(feedback, 'meta_browser') || {};
       var str = (_.get(browser, 'browser.name')||"") + " " + (_.get(browser, 'browser.major')||"") + " - " + (_.get(browser, 'os.name')||"")
       row[column.key] = str
    }

    else if(column.key.split('meta_').length > 1){
      var key = column.key.split('meta_')[1]
      var metas = _.get(feedback, 'meta_query') || [];
      var foundMeta = _.find(metas, {key: key});
      if(foundMeta){
        row[column.key] = foundMeta.val
      } else row[column.key] = ''

    }

    else {

        try{
          var data = _.find(feedback.data, {question_id: oid(column.key)});
        }catch(er){}
        try{
          if(!data) data = _.find(feedback.data, {question_id: oid(column.key.split("_")[0])})
        } catch(er){}


      if(data){
        if(['Button'].indexOf(column.type) > -1){
          row[column.key] = (data.value*100).toString();
        } else if(['Word'].indexOf(column.type) > -1){
          row[column.key] = typeof data.value === 'object' ? 
            data.value.map(dataValue=> column.choiceMap[dataValue]).join(' | ') :
            column.choiceMap[data.value]
        } else if(column.type == 'Image'){
          row[column.key] = (format == 'xlsx' || format == 'csv') ? column.choiceMap[data.value] : {label: column.choiceMap[data.value], url: column.urls[data.value]}
        } else if(['Slider', 'Contact'].indexOf(column.type) > -1){
          var dataKey = column.key.split("_")[1]
          var dataVal = _.find(data.value, {id: dataKey})
          if(dataVal){
            row[column.key] = column.type === 'Slider'
                ? (dataVal.data*(column.smallScale ? 5 : 10)).toString() 
                : encryption.decrypt(dataVal.data)
          }
        } else if(column.type === 'Text'){
            if (!data.hidden) row[column.key] = encryption.decrypt(data.value)
        } else if(column.type === 'NPS'){
          row[column.key] = (data.value*10).toString();
        } else if(column.type === 'Upsell'){
          row[column.key] = true /// TODO
        }

      }




    }


  //  if(row[column.key] == undefined) row[column.key] = ""

  })

  return row;

}

module.exports = {createRow}
