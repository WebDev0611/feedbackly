(function() {

  class SurveyPreviewController {
    /*@ngInject*/
    constructor(activeSurvey, $state, SurveySettingsStore, deviceConstants, SurveyPreviewTabs, SurveyWorkflow, activeChannels) {
      this.state = $state;
      this.survey = activeSurvey;
      this._SurveyWorkflow = SurveyWorkflow;
      this.surveySettings = SurveySettingsStore.getSettings(this.survey._id);
      this.activeChannels = this.surveySettings.activeChannels ? this.surveySettings.activeChannels : activeChannels;

      this.tabs = SurveyPreviewTabs.getTabsForAllTypes();
      this.tabClass = `col${Math.floor(12 / this.tabs.length)}`;
    }

    goToState(state) {
      this.state.go(state, { surveyId: this.survey._id });
    }

  }

  angular.module('tapinApp.routes')
    .controller('SurveyPreviewController', SurveyPreviewController);

})();
