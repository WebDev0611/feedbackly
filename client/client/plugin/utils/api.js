var request = require('./request');

function getSurvey(udid, succ, err) {
  request.get(`${window.FEEDBACK_CLIENT_URL}/surveys/${udid}/json`, succ, err);
}

function getPreview(surveyId, succ, err) {
  request.get(`${window.FEEDBACK_CLIENT_URL}/previews/${surveyId}/json`, succ, err);
}

function createFbevent(fbevent, succ, err) {
  request.post(`${window.FEEDBACK_CLIENT_URL}/api/fbevents`, fbevent, succ, err);
}

function getTranslations(succ, err) {
  request.get(`${window.FEEDBACK_CLIENT_URL}/api/translations`, succ, err);
}

module.exports = { getSurvey, createFbevent, getPreview, getTranslations };
