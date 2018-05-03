(function() {

  function redirect($urlRouterProvider) {
    $urlRouterProvider.otherwise(() => {
    //  if(window.USER_HAS_FEEDBACK || window.USER_HAS_FINISHED_TUTORIAL) {
        return '/summary';
    //  } else {
    //    return '/tutorial';
    //  }
    });
  }

  redirect.$inject = ['$urlRouterProvider'];

  angular.module('tapinApp.routes', [])
    .config(redirect);

})();
