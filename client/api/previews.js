var surveys = require('app-modules/middlewares/surveys');
var clientRenderer = require('app-modules/middlewares/client-renderer');
var clientState = require('app-modules/middlewares/client-state');

var Survey = require('app-modules/models/survey');

module.exports = app => {

  app.get('/previews/:surveyId',
    clientRenderer.renderClientWithMiddlewares([
      surveys.getSurveyById(req => req.params.surveyId),
      clientState.setClientPreviewStatus(req => true),
    ]));

  app.get('/previews/:surveyId/json',
    surveys.getSurveyById(req => req.params.surveyId),
    (req, res, next) => {
      return res.json(survey);
    });
}
