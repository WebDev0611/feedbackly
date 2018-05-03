(function() {

  class SurveyPluginPreviewController {
    /*@ngInject*/
    constructor(activeSurvey, Plugin, $scope) {
      this._plugin = new Fbly('preview', undefined , activeSurvey._id)

      $scope.$on('$destroy', () => this._plugin.close());

    }

    openPlugin(type){
      console.log(this._plugin)
      this._plugin.close()
      this._plugin.open(type)
    }
  }

  angular.module('tapinApp.routes')
    .controller('SurveyPluginPreviewController', SurveyPluginPreviewController);

})();
