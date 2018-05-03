(function() {

  class WordPreview extends PreviewComponent {
    constructor() {
      super();
    }
  }

  angular.module('tapinApp.components')
    .component('wordPreview', {
      bindings: {
        translation: '<',
        question: '<'
      },
      controller: WordPreview,
      controllerAs: 'wordPreview',
      templateUrl: '/app/components/previews/word-preview/word-preview.template.html'
    });

})();
