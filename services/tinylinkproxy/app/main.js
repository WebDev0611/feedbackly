const mongoose = require('mongoose');

async function getSurveyLink(mini_id){
    const directions = await mongoose.connection.db.collection('survey-mini-ids').findOne({mini_id: mini_id});
    const host = process.env.CLIENT_URL;
    return `${host}/surveys/?surveyId=${directions.survey_id}&deviceId=${directions.device_id}`
}

function createMetaLink(link,metaId){
    return `${link}&_z=${metaId}`
}

async function main(req, res){
  const surveyMiniId = req.params.surveyMiniId;
  const contactMiniId = req.params.contactMiniId;

  if(surveyMiniId){
    let link = await getSurveyLink(surveyMiniId)
    if(contactMiniId){
      link = createMetaLink(link, contactMiniId)
    }

    res.redirect(link)
  }
}


module.exports = main;
