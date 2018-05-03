(function() {

  class SurveySmsSettingsController {
    /*@ngInject*/
    constructor(
      activeSurvey,
      activeChannels,
      $state,
      SurveySettingsStore,
      $sce,
      $filter,
      Restangular,
      Toaster,
      UserStore,
      Gsm7,
      $http,
      featureConstants
    ){
      this._$http = $http;
      this._Gsm7 = Gsm7;
      this.SMS_LINK_TOKEN = "(link)";
      this._$sce = $sce;
      this.survey = activeSurvey;
      this.state = $state;
      this._$filter = $filter;
      this._SurveySettingsStore = SurveySettingsStore;
      this._surveySettings = this._SurveySettingsStore.getSettings(this.survey._id);
      this.activeChannels = this._surveySettings.activeChannels ? this._surveySettings.activeChannels : activeChannels;
      UserStore.getUserRights().then(rights => {
        this.canSendSms = rights.availableFeatures.indexOf(featureConstants.SMS_MESSAGES) > -1;
        this.isOrganizationAdmin = rights.organization_admin;
      })
      this._Restangular = Restangular;
      this._Toaster = Toaster;
      this.smsSettings = this._surveySettings.smsSettings || {textBody: this.SMS_LINK_TOKEN, fromName: "", unicode: false}

      this.smsChannels = _.filter(this.activeChannels, {type: "SMS"})
      if(this.smsChannels.length > 0){
        this._link = 'http://fby.io/example'
      } else this.goToState("surveys.routes-selection")

      this.getBalance = () => {
        this.loadingBalance = true;
        this._$http.get('/api/v2/sms/balance')
        .then(
          response => {
            this.balance = response.data.balance;
            this.loadingBalance = false;
          },
          err => {
            console.log(err)
          }
        )
        
      }

      this.getBalance()

    }

    goToState(state){
      this.smsSettings.creditCount = this.messageAmount()
      this.smsSettings.unicode = !this._Gsm7.isGSM7(this.smsSettings.textBody)
      this._SurveySettingsStore.updateSettings(this.survey._id, {smsSettings: this.smsSettings})
      this.state.go(state, { surveyId: this.survey._id });
    }

    getSurveyLink(){
      return this._link || ""
    }

    formatSender(){
      this.smsSettings.fromName = this.smsSettings.fromName.split(" ").join("").substring(0,11)
    }

    formatTextWithLink(text){
      var output;
      var link = `<a href="${this.getSurveyLink()}" target="_blank">${this.getSurveyLink()}</a>`;
      if(text.indexOf(this.SMS_LINK_TOKEN) > -1){
        output = text.replace(this.SMS_LINK_TOKEN, link);
      } else output = text + " " + link;
      if(output.length === 0) output+="&nbsp;";
      return this._$sce.trustAsHtml(output);
    }

    messageAmount(){
      var msg = this._$filter('stripTags')(this.formatTextWithLink(this.smsSettings.textBody));
      this.smsSettings.unicode = !this._Gsm7.isGSM7(msg)
      var maxLength =  this.smsSettings.unicode ? 70 : 160
      return Math.ceil(msg.length/maxLength);
    }


    previewHeight(){
      return $(".mobile-preview .chat p").outerHeight() + $(".mobile-preview .from").outerHeight() + $(".device-mockup").outerHeight()*0.2363;
    }

    sendTestSms() {
      this._Restangular.one('sms_channels', this.smsChannels[0]._id)
        .all('send')
        .post({
          surveyId: this.survey._id,
          textBody: this.smsSettings.textBody,
          isTest: true,
          phoneNumber: this.smsSettings.testSmsNumber,
          fromName: this.smsSettings.fromName,
          unicode: !this._Gsm7.isGSM7(this.smsSettings.textBody)
        }).then(() => {
          this._Toaster.success(this._$filter("translate")("Test SMS sent to") + " " + this.smsSettings.testSmsNumber);
        })
    }

  }

  angular.module('tapinApp.routes')
    .controller('SurveySmsSettingsController', SurveySmsSettingsController);

})();
