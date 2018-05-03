(function() {

  function config(stripeProvider) {
    var publicKey = window.envConfig.STRIPE_PUBLIC_KEY;

    stripeProvider.setPublishableKey(publicKey);
  }

  config.$inject = ['stripeProvider'];

  angular.module('tapinApp')
    .config(config);

})();
