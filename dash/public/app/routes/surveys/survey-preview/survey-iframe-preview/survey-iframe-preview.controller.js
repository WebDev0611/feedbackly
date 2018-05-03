(function() {

  class SurveyIframePreviewController {
    /*@ngInject*/
    constructor(activeSurvey, $stateParams) {
      this.survey = activeSurvey;
      this.type = $stateParams.type;
    }
  }

  angular.module('tapinApp.routes')
    .controller('SurveyIframePreviewController', SurveyIframePreviewController);

})();
