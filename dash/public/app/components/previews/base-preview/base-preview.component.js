(function() {

  class BasePreview {
    constructor() {}
  }

  angular.module('tapinApp.components')
    .component('basePreview', {
      bindings: {
        question: '<',
        translation: '<',
        noBackground: '@'
      },
      controller: BasePreview,
      controllerAs: 'basePreview',
      templateUrl: '/app/components/previews/base-preview/base-preview.template.html'
    });

})();
