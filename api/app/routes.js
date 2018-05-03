// api.feedbackly.com
const API_PATH = ""
const REST_VERSION="v1"
const auth = require('../lib/auth')
const Results = require('./results')
const Surveys = require('./surveys')
const Notifications = require('./notifications')
const Questions = require('./questions')
const Sms = require('./sms')
const Feedbacks = require('./feedbacks')
const WeeklyDigests = require('./weekly-digests')
const Marketing = require('./marketing');
const Channels = require('./channels')
const PublicFeedbackCount = require('./public-feedback-count');

module.exports = app => {

  /*
  PUBLIC ENDPOINTS
  */

  // feedbacks
  app.get(`${API_PATH}/:apiVersion/feedbacks`, auth.isLoggedIn(), Feedbacks.get);
  app.get(`${API_PATH}/:apiVersion/feedbacks/:id`, auth.isLoggedIn(), Feedbacks.getById);

  // questions
  app.get(`${API_PATH}/:apiVersion/questions/:id`, auth.isLoggedIn(), Questions.getById);

  // surveys
  app.get(`${API_PATH}/:apiVersion/surveys`, auth.isLoggedIn(), Surveys.get)
  app.get(`${API_PATH}/:apiVersion/surveys/:id`, auth.isLoggedIn(), Surveys.getById)
  
  // channels
  app.get(`${API_PATH}/:apiVersion/channels/:id`, auth.isLoggedIn(), Channels.getById)

  /* 
  PRIVATE ENDPOINTS
  */


  app.get(`${API_PATH}/results/:question_id`, auth.isLoggedIn, Results.getByQuestionId)
  app.get(`${API_PATH}/results/default-settings`, auth.isLoggedIn, Results.defaultSettings)
  app.get(`${API_PATH}/results/pdf`, auth.isLoggedIn, Results.getPDF)

 
  app.put(`${API_PATH}/surveys/:id`, auth.isLoggedIn, Surveys.put)
  app.post(`${API_PATH}/surveys`, auth.isLoggedIn, Surveys.post)
  app.post(`${API_PATH}/surveys/activate`, auth.isLoggedIn, Surveys.activate)
  app.get(`${API_PATH}/surveys/:id/copy`, Surveys.copy)

  app.post(`${API_PATH}/sms/send`, auth.isLoggedIn, Sms.send);

  app.get(`${API_PATH}/notifications`, auth.isLoggedIn, Notifications.get)
  app.get(`${API_PATH}/notifications/:id`, auth.isLoggedIn, Notifications.getById)
  app.post(`${API_PATH}/notifications`, auth.isLoggedIn, Notifications.post)
  app.put(`${API_PATH}/notifications/:id`, auth.isLoggedIn, Notifications.put)
  app.delete(`${API_PATH}/notifications/:id`, auth.isLoggedIn, Notifications.remove)
  app.get(`${API_PATH}/notifications/:id/unsubscribe`, Notifications.unsubscribe)
  app.get(`${API_PATH}/notifications/:id/handle`, Notifications.handleById)
  
  app.get(`${API_PATH}/feedbacks/:id/handle`, Notifications.handleById)

  app.delete(`${API_PATH}/feedbacks/:id`, auth.isLoggedIn, Feedbacks.remove);

  app.get(`${API_PATH}/weekly-digest/unsubscribe/:id`, WeeklyDigests.unsubscribe);

  app.post(`${API_PATH}/marketing/count_filter`, Marketing.countFilter);
  app.post(`${API_PATH}/marketing/email_webhook`, Marketing.emailWebhook);
  app.get(`${API_PATH}/unsubscribe`, Marketing.unsubscribe);
  app.post(`${API_PATH}/unsubscribe`, Marketing.unsubscribe);
  app.get(`${API_PATH}/sms-delivery-receipts`, Sms.deliveryReceipt);
  

  app.get(`${API_PATH}/public-feedback-count`, PublicFeedbackCount.getCountFor30Days)

  // HOOKS

  // STRIPE HOOKS

}
