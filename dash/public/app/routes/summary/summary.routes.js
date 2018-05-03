(function() {

  function routes($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('summary', {
        url: '/summary',
        controller: 'SummaryController',
        controllerAs: 'summary',
        templateUrl: '/app/routes/summary/summary.template.html'
      });
  }

  routes.$inject = ['$stateProvider', '$urlRouterProvider'];

  angular.module('tapinApp.routes')
    .config(routes);

})();
