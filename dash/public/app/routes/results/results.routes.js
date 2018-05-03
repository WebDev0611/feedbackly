(function() {

  function searchDefaultsResolve(Restangular) {
    return Restangular
      .all('feedbacks')
      .one('default')
      .get();
  }

  searchDefaultsResolve.$inject = ['Restangular'];

  function routes($stateProvider) {
    $stateProvider
      .state('results', {
        url: '/results',
        controller: 'ResultsController',
        controllerAs: 'results',
        templateUrl: '/app/routes/results/results.template.html',
        resolve: {
          defaults: searchDefaultsResolve
        }
      });
  }

  routes.$inject = ['$stateProvider'];

  angular.module('tapinApp.routes')
    .config(routes);

})();
