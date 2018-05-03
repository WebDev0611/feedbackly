(function() {

  function routes($stateProvider, $urlRouterProvider) {
    var iframePreview = {
      controller: 'SurveyIframePreviewController',
      controllerAs: 'iframePreview',
      templateUrl: '/app/routes/surveys/survey-preview/survey-iframe-preview/survey-iframe-preview.template.html',
      saveGroup: 'SURVEYS'

    };

    $stateProvider
      .state('surveys.preview.ipadPreview', _.assign({
        url: '/feedback-device',
        params: {
          type: 'DEVICE'
        }
      }, iframePreview))
      .state('surveys.preview.mobilePreview', _.assign({
        url: '/mobile',
        params: {
          type: 'MOBILE'
        }
      }, iframePreview))
      .state('surveys.preview.webPreview', _.assign({
        url: '/web',
        params: {
          type: 'WEB'
        }
      }, iframePreview))
      .state('surveys.preview.pluginPreview', {
        url: '/plugin',
        controller: 'SurveyPluginPreviewController',
        controllerAs: 'pluginPreview',
        templateUrl: '/app/routes/surveys/survey-preview/survey-plugin-preview/survey-plugin-preview.template.html'
      });
  }

  routes.$inject = ['$stateProvider', '$urlRouterProvider'];

  angular.module('tapinApp.routes')
    .config(routes);

})();
