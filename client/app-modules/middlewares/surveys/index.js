var flow = require('middleware-flow');
var _ = require('lodash');

var general = require('app-modules/middlewares/general');

var Device = require('app-modules/models/device');
var Survey = require('app-modules/models/survey');

function getSurveyByUdid(getUdid) {
  return flow.series(
    general.existsOrError({
      getPromise: req => Device.findOne({ udid: getUdid(req) }),
      name: 'channel'
    }),
    general.existsOrNotActiveError({
      getPromise: req => Survey.findOneWithoutHiddenQuestions({ _id: req.channel.active_survey }),
      name: 'survey'
    })
  );
}

function getSurveyById(getId) {
  return getSurvey(req => ({ _id: getId(req) }));
}

function getSurvey(getQuery) {
  return general.existsOrError({
    getPromise: req => Survey.findOneWithoutHiddenQuestions(getQuery(req)),
    name: 'survey'
  });
}

module.exports = { getSurveyByUdid, getSurvey, getSurveyById };
