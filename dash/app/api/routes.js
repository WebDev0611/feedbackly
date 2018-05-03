const Channelgroups = require('./channelgroups');
const API_PATH = '/api/v2'
const auth = require('../lib/auth')
const rights = require('../lib/rights')
const requestValidator = require('../lib/request-validator');
const Fbevents = require('./fbevents')
const Channels = require('./channels');
const PluginScripts = require('./plugin-scripts');
const Upsells = require('./upsells.js')
const Engagepoints = require('./engagepoints')
const Notifications = require('./notifications')
const Surveys = require('./surveys');
const FeedbackList = require('./feedback-list')
const IpadSignup = require('./ipad-signup');
const VueSignup = require('./signup')
const ReferralInvitation = require('./invitation')
const VueSignupToken = require('./signup/token')
const Organizations = require('./organizations');
const Referral = require('./Referral');
const Users = require('./users')
const Inbox = require('./inbox');
const uniqueLink = require('./uniqueLink')

const SmsTopUp = require('./sms/top-up')
const Sms = require('./sms');

var cors = require('cors')

const Statistics = require('./statistics')

module.exports = function (app) {
  app.get(`${API_PATH}/channelgroups/:id`, auth.isLoggedIn(), rights.getEverythingMW(), Channelgroups.getById);
  app.get(`${API_PATH}/channelgroups`, auth.isLoggedIn(), rights.getEverythingMW(), Channelgroups.getAll);
  app.post(`${API_PATH}/channelgroups`, rights.isAuthenticatedAndOrgAdmin(), Channelgroups.post);
  app.put(`${API_PATH}/channelgroups/:id`, rights.isAuthenticatedAndOrgAdmin(), rights.getEverythingMW(), Channelgroups.updateById);
  app.delete(`${API_PATH}/channelgroups/:id`, rights.isAuthenticatedAndOrgAdmin(), rights.getEverythingMW(), Channelgroups.deleteById);

  app.post(`${API_PATH}/channels`, auth.isLoggedIn(), rights.getEverythingMW(), Channels.post);
  app.put(`${API_PATH}/channels/:id`, auth.isLoggedIn(), Channels.put);


  app.get(`${API_PATH}/magento/scripts`, PluginScripts.get)

  app.delete(`${API_PATH}/feedbacks/:id`, rights.isAuthenticatedAndOrgAdmin(), Fbevents.deleteByFeedbackId);

  app.get(`${API_PATH}/upsells`, auth.isLoggedIn(), Upsells.get)
  app.get(`${API_PATH}/upsells/:id`, auth.isLoggedIn(), Upsells.getById)
  app.post(`${API_PATH}/upsells`, auth.isLoggedIn(), Upsells.post)
  app.put(`${API_PATH}/upsells/:id`, auth.isLoggedIn(), Upsells.put)
  app.delete(`${API_PATH}/upsells/:id`, auth.isLoggedIn(), Upsells.remove)
  app.post(`${API_PATH}/upsells/:id/activate`, auth.isLoggedIn(), rights.getEverythingMW(), Upsells.activate)


  app.post(`${API_PATH}/engagepoints`, auth.isLoggedInAndAdmin(), Engagepoints.post)
  app.get(`${API_PATH}/engagepoints/codes`, auth.isLoggedInAndAdmin(), Engagepoints.getCodes)

  app.get(`${API_PATH}/surveys-new`, auth.isLoggedIn(), Surveys.get)

  app.post(`${API_PATH}/notifications`, auth.isLoggedIn(), rights.getEverythingMW(), Notifications.post)
  app.put(`${API_PATH}/notifications/:id`, auth.isLoggedIn(), rights.getEverythingMW(), Notifications.put)
  app.get(`${API_PATH}/notifications`, auth.isLoggedIn(), rights.getEverythingMW(), Notifications.get)
  app.get(`${API_PATH}/notifications/:id`, auth.isLoggedIn(), rights.getEverythingMW(), Notifications.getById)
  app.delete(`${API_PATH}/notifications/:id`, auth.isLoggedIn(), rights.getEverythingMW(), Notifications.remove)


  app.put(`${API_PATH}/surveys/:id`, auth.isLoggedIn(), auth.canEditSurvey(req => req.params.id), Surveys.put);
  app.get(`${API_PATH}/surveys/:id`, auth.isLoggedIn(), auth.surveyIsInOrganization(req => req.params.id), Surveys.get);
  app.get(`${API_PATH}/surveys`, auth.isLoggedIn(), Surveys.getAll);

  app.post(`${API_PATH}/feedback-list/create-request`, auth.isLoggedIn(), FeedbackList.createRequest)
  app.get(`${API_PATH}/feedback-list`, auth.isLoggedIn(), rights.getEverythingMW(), FeedbackList.get)
  app.get(`${API_PATH}/feedback-list-pdf/:userId`, FeedbackList.getPDF)

  app.get(`${API_PATH}/stats`, auth.isLoggedInAndAdmin(), Statistics.get)

  app.get(`${API_PATH}/users/:id/apikeys`, rights.isAuthenticatedAndOrgAdmin(), Users.getApiKeys);
  app.post(`${API_PATH}/users/:id/apikeys/generate`, rights.isAuthenticatedAndOrgAdmin(), Users.generateApiKey);
  app.put(`${API_PATH}/users/:id/apikeys/:apikey/revoke`, rights.isAuthenticatedAndOrgAdmin(), Users.revokeApiKey);
  app.delete(`${API_PATH}/users/:id`, rights.isAuthenticatedAndOrgAdmin(), Users.deleteUser);

  // Unique link generator
    app.post(`${API_PATH}/uniqueLink`, uniqueLink.getUniqueLink);

  app.get(`${API_PATH}/organizations/:id`, auth.isLoggedInAndAdmin(), Organizations.getById);
  app.put(`${API_PATH}/organizations/:id`, rights.isAuthenticatedAndOrgAdmin(), Organizations.postPut)
  app.post(`${API_PATH}/organizations`, auth.isLoggedInAndAdmin(), Organizations.postPut)
  app.post(`${API_PATH}/organizations/credit-card-token`, rights.isAuthenticatedAndOrgAdmin(), Organizations.saveCreditCardToken)
  app.post(`${API_PATH}/organizations/change-plan`, rights.isAuthenticatedAndOrgAdmin(), Organizations.changePlan)
  app.get(`${API_PATH}/organization/charges`, rights.isAuthenticatedAndOrgAdmin(), Organizations.getOrganizationCharges)

  app.get(`${API_PATH}/organization`, auth.isLoggedIn(), Organizations.getOrganization)
  
  // Referral
  app.get(`${API_PATH}/referral-status`, auth.isLoggedIn(), Referral.getOrganization)

  // Ipad signup
  app.post(`${API_PATH}/sign-up/ipad`, cors(), IpadSignup.signUp);
  app.post(`${API_PATH}/sign-up/ipad-details`, cors(), IpadSignup.signupDetails);

  app.get(`/ipad-signup`, IpadSignup.signupForm);

  // Vue signup
  app.post(`${API_PATH}/sign-up-email`, cors(), VueSignupToken.encodeToken)
  app.post('/api/sign-up', cors(), VueSignupToken.encodeToken)

  app.get(`${API_PATH}/vue-signup/:token`, VueSignupToken.decodeToken)
  app.post(`${API_PATH}/vue-signup`, VueSignup.post);

  // -----popup----
    app.post(`${API_PATH}/referral-invitation`, cors(), ReferralInvitation.post);
    //   ----------
  app.put(`${API_PATH}/users/:id`, auth.isLoggedIn(), Users.postPut)
  app.post(`${API_PATH}/users`, auth.isLoggedIn(), Users.postPut)
  app.get(`${API_PATH}/users`, auth.isLoggedIn(), Users.get)

  // INBOX

  app.get(`${API_PATH}/inbox`, auth.isLoggedIn(), rights.getEverythingMW(), Inbox.get)
  app.get(`${API_PATH}/inbox/:id`, auth.isLoggedIn(), rights.getEverythingMW(), Inbox.getById)
  app.put(`${API_PATH}/inbox/:id/process`, auth.isLoggedIn(), rights.getEverythingMW(), Inbox.process)
  app.post(`${API_PATH}/inbox/:id/messages`, auth.isLoggedIn(), rights.getEverythingMW(), Inbox.postMessage)
  // user ping

  app.get(`${API_PATH}/ping`, auth.isLoggedIn(), Users.ping)

  // sms
  app.get(`${API_PATH}/sms/receive-webhook`, Sms.webhook)

  app.get(`${API_PATH}/sms/balance`, auth.isLoggedIn(), SmsTopUp.getBalance)
  app.post(`${API_PATH}/sms/top-up`, auth.isLoggedIn(), SmsTopUp.topUp)
  app.post(`${API_PATH}/sms/top-up-admin`, auth.isLoggedInAndAdmin(), SmsTopUp.systemAdminTopUp)

  app.get(`${API_PATH}/sms/update-statuses`, Sms.checkPlivoStatuses)

}
