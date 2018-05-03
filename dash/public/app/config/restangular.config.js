(function() {

  function config(RestangularProvider) {
    RestangularProvider.setRestangularFields({
      id: '_id'
    });

    RestangularProvider.setBaseUrl('/api');
  }

  config.$inject = ['RestangularProvider'];

  angular.module('tapinApp')
    .config(config);

})();
