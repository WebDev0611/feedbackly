(function () {
  class SurveyEmailSettingsController {
    /* @ngInject */
    constructor (
      organization,
      activeSurvey,
      activeChannels,
      $state,
      SurveySettingsStore,
      Buttons,
      Restangular,
      Toaster,
      Languages,
      $filter,
      UserStore
    ){
      this._Restangular = Restangular;
      this.survey = activeSurvey;
      this._Buttons = Buttons;
      this._Toaster = Toaster;
      this._Languages = Languages;
      this._SurveySettingsStore = SurveySettingsStore;
      this.surveySettings = this._SurveySettingsStore.getSettings(this.survey._id);
      this.emailSettings = _.get(this.surveySettings, 'emailSettings') || { surveyId: this.survey._id };
      this._$filter = $filter;

      var questions = _.get(this.survey, 'question_ids');
      var tr;
      if (questions.length > 0) {
        this.emailSettings.question = questions[0];
        this.emailSettings.language = this.survey.languages[0];
      }

      if (this.emailSettings.question.question_type === 'Button') {
        this.buttonCount = this.emailSettings.question.choices.length;
        this.buttonImages = this._Buttons.buttonImages({ buttonCount: this.buttonCount, format: 'png' });
      }

      if (this.emailSettings.question.question_type === 'NPS') {
        this.npsValues = _.range(0, 11);
      }

      if ((['Image', 'Slider', 'Word'].indexOf(this.emailSettings.question.question_type) > -1)) {
        this.column1Data = [];
        this.column2Data = [];
        _.forEach(this.emailSettings.question.choices, (c, index) => {
          if (index % 2 === 0) {
            this.column1Data.push(c);
          } else this.column2Data.push(c);
        });
      }

      this.state = $state;
      this._organization = organization;

      this.activeChannels = this.surveySettings.activeChannels ? this.surveySettings.activeChannels : activeChannels;
      this.emailLists = _.filter(this.activeChannels, { type: 'EMAIL' });
      if (this.emailLists.length === 0) this.goToState('surveys.routes-selection');
      this.emailSettings.organizationLogoUrl = organization.logo;
      this.emailSettings.language = UserStore.getUserSignedIn().settings.locale;
      let channelLogo;
      this.activeChannels.filter(channel=>{
        return channel.type == 'EMAIL' && channelLogo == channel.logo
      })
      this.logo = channelLogo && channelLogo.logo || this.emailSettings.organizationLogoUrl || ''
    }

    goToState (state) {
      this._SurveySettingsStore.updateSettings(this.survey._id, { emailSettings: this.emailSettings });
      this.state.go(state, { surveyId: this.survey._id });
    }

    getButtonLabel (index) {
      index = this.buttonCount - index - 1; // flip index for labels
      var values = this.buttonCount === 5
        ? ['100', '075', '050', '025', '000']
        : ['100', '066', '033', '000'];

      return [_.get(this.emailSettings.question.choices[index], `text[${this.emailSettings.language}]`), this._Buttons.buttonValueToColor(parseFloat(values[index]) / 100)] || ['', ''];
    }

    sendTest () {
      var data = {
        surveyId: this.survey._id,
        language: this.emailSettings.language,
        question: this.emailSettings.question,
        textBody: this.emailSettings.textBody,
        testEmail: this.emailSettings.testEmail,
        subject: this.emailSettings.subject,
        fromName: this.emailSettings.fromName,
        fromEmail: this.emailSettings.fromEmail,
        organizationLogoUrl: this.emailSettings.organizationLogoUrl,
        isTest: true
      };
      /* Validating email, and other required field is empty or not */
      const validate = (() => {
        const testEmail = (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
          .test(data.testEmail));
        const fromEmail = (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
          .test(data.fromEmail));
        const fromName = data.fromName && data.fromName.length > 0;
        const subject = data.subject && data.subject.length > 0;
        return (testEmail && fromEmail && fromName && subject);
      })();
      if (!validate) return; // failing silently. Need to give user feedback
      return this._Restangular
        .one('mailinglists', this.emailLists[0]._id)
        .all('send')
        .post(data)
        .then(() => {
          this._Toaster.success('Test mail sent.');
        });
    }

    getLanguageName (code) {
      return this._Languages.getLanguageName(code);
    }
  }

  angular.module('tapinApp.routes')
    .controller('SurveyEmailSettingsController', SurveyEmailSettingsController);
})();
