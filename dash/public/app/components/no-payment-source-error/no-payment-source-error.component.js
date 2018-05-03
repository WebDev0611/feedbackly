(function() {

  class PaymentSourceError {
    /*@ngInject*/
    constructor() {
    }
  }

  angular.module('tapinApp.components')
    .component('noPaymentSourceError', {
      bindings: {
        show: '<',
        showBillingLink: '<'
      },
      controller: PaymentSourceError,
      templateUrl: '/app/components/no-payment-source-error/no-payment-source-error.template.html',
      controllerAs: 'noPaymentSourceError'
    });

})();
