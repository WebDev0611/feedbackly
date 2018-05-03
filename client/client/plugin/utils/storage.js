var STORAGE_KEY = 'FEEDBACK_PLUGIN_SURVEYS_FINISHED';
var TTL_HOURS = 24;

function isAlive(timestamp) {
  if(typeof(Storage) === 'undefined') return true;

  if(timestamp === undefined) {
    return false;
  }

  var now = +(new Date());
  var differenceInHours = (now - timestamp) / (1000 * 60 * 60);

  return differenceInHours < TTL_HOURS;
}

function setSurveyAsFinished(udid) {
  if(typeof(Storage) === 'undefined') return false;

  var data = JSON.parse(localStorage[STORAGE_KEY] || '{}');

  data[udid.toString()] = +(new Date());

  localStorage[STORAGE_KEY] = JSON.stringify(data);
}

function surveyIsFinished(udid) {
  if(typeof(Storage) === 'undefined') return false;

  var data = JSON.parse(localStorage[STORAGE_KEY] || '{}');
  var finishedAt = data[udid.toString()];
  var alive = isAlive(finishedAt);

  if(!alive) {
    delete data[udid.toString()];

    localStorage[STORAGE_KEY] = JSON.stringify(data);
  }

  return alive;
}

module.exports = { setSurveyAsFinished, surveyIsFinished };
