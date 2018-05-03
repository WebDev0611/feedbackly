(function() {

  function searchDefaultsResolve(Restangular) {
    return Restangular
      .all('feedbacks')
      .one('default')
      .get();
  }

  searchDefaultsResolve.$inject = ['Restangular'];

  function getUserRights(UserStore){
    return UserStore.getUserRights()
  }

  getUserRights.$inject = ['UserStore']

  function routes($stateProvider) {
    $stateProvider
      .state('feedbacks', {
        url: '/feedbacks',
        controller: 'FeedbacksController',
        controllerAs: 'feedbacks',
        templateUrl: '/app/routes/feedbacks/feedbacks.template.html',
        resolve: {
          defaults: searchDefaultsResolve,
          rights: getUserRights
        }
      });
  }

  routes.$inject = ['$stateProvider'];

  angular.module('tapinApp.routes')
    .config(routes);

})();
