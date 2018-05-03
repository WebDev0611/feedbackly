(function() {

  class ImagePreview extends PreviewComponent {
    constructor() {
      super();
    }
  }

  angular.module('tapinApp.components')
    .component('imagePreview', {
      bindings: {
        translation: '<',
        question: '<'
      },
      controller: ImagePreview,
      controllerAs: 'imagePreview',
      templateUrl: '/app/components/previews/image-preview/image-preview.template.html'
    });

})();
