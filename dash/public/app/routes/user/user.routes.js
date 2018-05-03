(function() {

  function routes($stateProvider) {
    $stateProvider
      .state('user', {
        url: '/user',
        templateUrl: '/app/routes/user/user.template.html',
        controller: 'UserController',
        controllerAs: 'user',
        abstract: true
      })
      .state('user.settings', {
        url: '/settings',
        templateUrl: '/app/routes/user/user-settings/user-settings.template.html',
        controller: 'UserSettingsController',
        controllerAs: 'userSettings'
      })
      .state('user.organizationManagement', {
        url: '/organization-management',
        template: 'Jees'
      });
  }

  routes.$inject = ['$stateProvider'];

  angular.module('tapinApp.routes')
    .config(routes);

})();
