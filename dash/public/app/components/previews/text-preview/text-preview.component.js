(function() {

  class TextPreview {
    constructor() { }
  }

  angular.module('tapinApp.components')
    .component('textPreview', {
      bindings: {
        translation: '<',
        question: '<'
      },
      controller: TextPreview,
      controllerAs: 'textPreview',
      templateUrl: '/app/components/previews/text-preview/text-preview.template.html'
    });

})();
