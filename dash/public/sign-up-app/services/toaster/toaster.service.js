(function() {

  class Toaster {
    constructor() {}

    neutral(message, duration = 3000) {
      Materialize.toast(message, duration);
    }

    success(message, duration = 3000) {
      Materialize.toast(message, duration, 'toast-success');
    }

    danger(message, duration = 3000) {
      Materialize.toast(message, duration, 'toast-danger');
    }
  }

  angular.module('signUpApp.services')
    .service('Toaster', Toaster);

})();
