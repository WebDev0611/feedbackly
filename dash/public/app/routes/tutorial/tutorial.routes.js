(function() {

  function routes($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('tutorial', {
        url: '/tutorial',
        controller: 'TutorialController',
        controllerAs: 'tutorial',
        templateUrl: '/app/routes/tutorial/tutorial.template.html'
      });
  }

  routes.$inject = ['$stateProvider', '$urlRouterProvider'];

  angular.module('tapinApp.routes')
    .config(routes);

})();
