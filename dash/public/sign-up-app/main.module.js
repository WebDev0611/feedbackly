(function() {

  angular.module('signUpApp', [
    'ui.router',
    'ngStorage',
    'restangular',
    'ngAnimate',
    'angular-stripe',
    'validation.match',
    'ui.materialize',
    'signUpApp.routes',
    'signUpApp.services',
    'signUpApp.components',
    'signUpApp.config'
  ]);

  document.addEventListener('DOMContentLoaded', function() {
  	angular.bootstrap(document, ['signUpApp'], { strictDi: true });
  });

})();
