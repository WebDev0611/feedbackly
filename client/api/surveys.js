var flow = require('middleware-flow');
var mongoose = require('mongoose')
var oid = mongoose.Types.ObjectId;

var errors = require('app-modules/errors');

var clientRenderer = require('app-modules/middlewares/client-renderer');
var surveys = require('app-modules/middlewares/surveys');
var channels = require('app-modules/middlewares/channels');
var validators = require('app-modules/middlewares/validators');

var moment = require('moment')

function surveyInJSON() {
  return flow.series(
    channels.getChannel(req => ({ udid: req.params.udid })),
    surveys.getSurveyById(req => req.channel.active_survey),
    (req, res, next) => {
      if(req.path.indexOf('question') > -1){
        if(req.query.token != '0033eeff39f20df001f') {
          return next(new errors.ForbiddenError());
        }

        return res.json({
          question: req.survey.question_ids.filter(question => question.hidden !== true)[0]
        });
      } else {
        return res.json({
          survey: req.survey,
          device: req.channel
        });
      }
    }
  );
}


var renderClientSurvey = clientRenderer.renderClientWithMiddlewares([
  surveys.getSurveyByUdid(req => req.params.udid),
  (req, res, next) => {
    if(req.query.decorators && req.query.decorators.indexOf('plugin') > -1){
      var day = moment.utc().startOf('day').unix()
      var channel_id = oid(req.channel._id);
      var query = {channel_id, day};
    }
    next();
  }
])


module.exports = app => {

  app.get('/surveys/:udid', renderClientSurvey);
  app.post('/surveys/:udid', renderClientSurvey);


  app.get('/surveys',
    validators.validateQuery({ surveyId: { presence: true }, deviceId: { presence: true } }),
    clientRenderer.renderClientWithMiddlewares([
      surveys.getSurveyById(req => req.query.surveyId),
      channels.getChannelById(req => req.query.deviceId)
    ]));

  app.get('/surveys/:udid/json',
    surveyInJSON());

  app.get('/surveys/:udid/question',
    surveyInJSON());
}
