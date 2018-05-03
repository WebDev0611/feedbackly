(function() {

  class ContactPreview extends PreviewComponent {
    constructor() {
      super();
    }
  }

  angular.module('tapinApp.components')
    .component('contactPreview', {
      bindings: {
        translation: '<',
        question: '<'
      },
      controller: ContactPreview,
      controllerAs: 'contactPreview',
      templateUrl: '/app/components/previews/contact-preview/contact-preview.template.html'
    });

})();
