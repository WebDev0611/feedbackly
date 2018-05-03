(function() {

  class NpsPreview {
    constructor() {
      this.buttons = _.chain(_.range(0,11)).map(number => number / 10).value();
    }
  }

  angular.module('tapinApp.components')
    .component('npsPreview', {
      bindings: {
        translation: '<',
        question: '<'
      },
      controller: NpsPreview,
      controllerAs: 'npsPreview',
      templateUrl: '/app/components/previews/nps-preview/nps-preview.template.html'
    });

})();
