(function() {

  angular.module('tapinApp', [
    'ui.router',
    'ngStorage',
    'ngSanitize',
    'restangular',
    'ui.materialize',
    'ngAnimate',
    'ui.gravatar',
    'angular-stripe',
    'validation.match',
    'angularMoment',
    'angularFileUpload',
    'angular-sortable-view',
    'ngCropper',
    'gettext',
    'angular-inview',
    'sticky',
    'angular-clipboard',
    'ui.select',
    'tapinApp.routes',
    'tapinApp.components',
    'tapinApp.services',
    'tapinApp.templates',
    'tapinApp.filters',
    'ngTagsInput',
    'react',
    'color.picker',

  ]);

  document.addEventListener('DOMContentLoaded', function() {
  	angular.bootstrap(document, ['tapinApp'], { strictDi: true });
  });

})();
