(function() {

  function routes($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/login');

    $stateProvider
      .state('signIn', {
        url: '/login',
        templateUrl: '/sign-up-app/routes/sign-in/sign-in.template.html',
        controller: 'SignInController',
        controllerAs: 'signIn'
      });
  }

  routes.$inject = ['$stateProvider', '$urlRouterProvider'];

  angular.module('signUpApp.routes')
    .config(routes);

})();
