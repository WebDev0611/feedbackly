(function() {

  function config($rootScope, $state, UserStore) {
    var user = UserStore.getUserSignedIn();

    $rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => {
      if(toParams.requireOrganizationAdmin === true && user.isOrganizationAdmin === false) {
        event.preventDefault();
      }
    });
  }

  config.$inject = ['$rootScope', '$state', 'UserStore'];

  angular.module('tapinApp')
    .run(config);

})();
