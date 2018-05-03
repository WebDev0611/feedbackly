(function() {

  class SliderPreview extends PreviewComponent {
    constructor() {
      super();
    }
  }

  angular.module('tapinApp.components')
    .component('sliderPreview', {
      bindings: {
        translation: '<',
        question: '<'
      },
      controller: SliderPreview,
      controllerAs: 'sliderPreview',
      templateUrl: '/app/components/previews/slider-preview/slider-preview.template.html'
    });

})();
