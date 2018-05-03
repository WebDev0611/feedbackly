(function() {

  function notificationResolve($http, $stateParams) {
    var id = $stateParams.id;
    if(!id) return undefined;
    return $http.get('/api/v2/notifications/' + id)
    .then(res => {
      return res.data;
    }, err => {
      console.log(err)
    })
  }

  notificationResolve.$inject = ['$http', '$stateParams'];

  function notificationsResolve($http){
      return $http.get('/api/v2/notifications')
      .then(res => {
        return res.data
      }, err => {
        console.log(err)
      })

  }

  notificationsResolve.$inject = ['$http']

  function surveysResolve($http){
    return $http.get('/api/v2/surveys').then(res => {
      return res.data;
    }, err => {
      console.log(err)
    })
  }

  surveysResolve.$inject = ['$http'];

  function channelTreeResolve(type) {
    var resolve = (UserStore) => {
      return UserStore.getUserRights()
      .then(rights => {
        var tree = rights.deviceTree;
        if(type){
          tree = _.filter(rights.deviceTree, {type: type})
        }
        return tree;
      })
    }

    resolve.$inject = ['UserStore'];

    return resolve;
  }

  function devicesResolve() {
    var resolve = (UserStore) => {
      return UserStore.getUserRights()
      .then(rights => {
        return rights.deviceObjects;
      })
    }

    resolve.$inject = ['UserStore'];

    return resolve;
  }

  function userGroupsResolve() {
    var resolve = (UserStore) => {
      return UserStore.getUserRights()
      .then(rights => {
        return rights.user_groups;
      })
    }

    resolve.$inject = ['UserStore'];

    return resolve;
  }

  function userRightsResolve(UserStore) {
    return UserStore.getUserRights();
  }
  userRightsResolve.$inject = ['UserStore'];


  function routes($stateProvider) {
    $stateProvider
      .state('notifications', {
        url: '/notifications/:id',
        controller: 'NotificationsController',
        controllerAs: 'notifications',
        templateUrl: '/app/routes/notifications/notifications.template.html',
        resolve: {
          surveys: surveysResolve,
          tree: channelTreeResolve(),
          devices: devicesResolve(),
          userGroups: userGroupsResolve(),
          userRights: userRightsResolve
        }
      })
      .state('notifications-list', {
        url: '/notifications-list',
        controller: 'NotificationsListController',
        controllerAs: 'notificationsList',
        templateUrl: '/app/routes/notifications/notifications-list.template.html',
        resolve: {
          userRights: userRightsResolve
        }
      });
  }

  routes.$inject = ['$stateProvider'];

  angular.module('tapinApp.routes')
    .config(routes);

})();
