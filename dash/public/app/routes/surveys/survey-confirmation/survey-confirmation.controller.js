(function() {

  class SurveyConfirmationController {

    goToState(state){
      this.state.go(state, { surveyId: this.survey._id });
    }

    emailCount(){
      var count = _.reduce(this.emailChannels, (count, ch) => { return count+=ch.contactCount }, 0)
      return count
    }

    smsCount(){
      var count = _.reduce(this.smsChannels, (count, ch) => { return count+=ch.contactCount }, 0)
      return count || 0;
    }

    smsCreditCount(){
      var count = this.smsCount()
      var singleSmsCredits = _.get(this, "surveySettings.smsSettings.creditCount") || 0;
      return count * singleSmsCredits;
    }

    getScheduleString(){
      if(this.surveySettings.schedule.plan === "schedule"){
        var str = moment.tz(this.surveySettings.schedule.time.unix*1000, this.surveySettings.schedule.time.tz).format("DD.MM.YYYY HH:mm") + " (" + this.surveySettings.schedule.time.tz + ")"
      }
      return str || ""
    }

    allSettingsOk(){
      var arr = _.toArray(this.settingsOk);
      return arr.indexOf(false) == -1
    }


    publish(){
      if(this.allSettingsOk() === true){
        this._Restangular.one('surveys', this.survey._id).post('publish', this.surveySettings)
          .then(() => {
            this._Toaster.success("Survey published successfully!");
            this.state.go('surveysList');
          })
      } else this._Toaster.neutral("Not ready to publish just yet. Check the settings.")
    }


    /*@ngInject*/
    constructor(
      activeSurvey,
      activeChannels,
      SurveySettingsStore,
      deviceConstants,
      $filter,
      $state,
      Restangular,
      Toaster,
      Languages,
      UserStore,
      userRights,
      $http
    ){
      this.settingsOk = { survey: true, distribution: true, publishTime: true }
      this.survey = activeSurvey;
      this._SurveySettingsStore = SurveySettingsStore;
      this.surveySettings = this._SurveySettingsStore.getSettings(this.survey._id);
      this.activeChannels = this.surveySettings.activeChannels ? this.surveySettings.activeChannels : activeChannels;
      this.surveySettings.activeChannels = this.activeChannels;
      this.surveySettings.schedule = this.surveySettings.schedule || {plan: "now"}
      this._$filter = $filter;
      this._deviceConstants = deviceConstants;
      this._Restangular = Restangular;
      this.state = $state;
      this._Toaster = Toaster;
      this._$http = $http;
      this.isOrganizationAdmin = userRights.organization_admin;

      if(!_.get(this, 'survey.question_ids') || this.survey.question_ids.length === 0){
        this.settingsOk.survey = false;
      }

      if(this.activeChannels.length == 0){
        this.settingsOk.distribution = false;
      }

      this.emailChannels = _.filter(this.activeChannels, {type: 'EMAIL'})
      this.smsChannels = _.filter(this.activeChannels, {type: 'SMS'})

      if(this.emailChannels.length > 0){
        if(this.emailCount() === 0) this.settingsOk.distribution = false;
        if(!this.surveySettings.emailSettings) this.settingsOk.distribution = false;
      }

      if(this.smsChannels.length > 0){
        if(this.smsCount() === 0) this.settingsOk.distribution = false;
        this._$http.get('/api/v2/sms/balance')
        .then(
          response => {
            this.balance = response.data.balance;
            if(this.balance < this.smsCreditCount() * 0.05) this.settingsOk.balance = false
            else this.settingsOk.balance = true;
          })
      }
    }


  }

  angular.module('tapinApp.routes')
    .controller('SurveyConfirmationController', SurveyConfirmationController);

})();
