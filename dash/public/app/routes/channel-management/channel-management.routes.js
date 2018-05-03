(function() {


  function rightsResolve(UserStore){
    return UserStore.getUserRights()
  }
  rightsResolve.$inject = ['UserStore']

  function devicesResolve(UserStore){
    return UserStore.getUserRights()
    .then(rights => {
      var deviceObjects =  rights.deviceObjects || [];
      deviceObjects.forEach(d => {
        var name = _.find(rights.activeSurveyNames, {_id: d.active_survey});
        d.activeSurveyName = _.get(name, 'name') || '';
      })
      return deviceObjects;
    })
  }
  devicesResolve.$inject = ['UserStore']

  function channelResolve(Restangular, $stateParams){
    var id = $stateParams.id;
    return Restangular.one('devices', id).get({include_meta: true})
  }
  channelResolve.$inject = ['Restangular', '$stateParams']


  function upsellResolve($http){
    return $http.get('/api/v2/upsells').then(res => {
      return res.data;
    }, err => {
      console.log(err)
    })
  }
  upsellResolve.$inject = ['$http']

  function channelGroupsResolve(UserStore){
    return UserStore.getUserRights()
    .then(rights => {
      return rights.devicegroupObjects;
    })
  }
  channelGroupsResolve.$inject = ['UserStore']

  function channelGroupResolve(UserStore, $stateParams){
    return UserStore.getUserRights()
    .then(rights => {
      return _.find(rights.devicegroupObjects, {_id: $stateParams.id});
    })
  }
  channelGroupResolve.$inject = ['UserStore', '$stateParams']


  function routes($stateProvider) {
    $stateProvider
      .state('channel-management', {
        url: '/channel-management',
        templateUrl: '/app/routes/channel-management/channel-management.template.html',
        controller: 'ChannelManagementController',
        controllerAs: 'channelManagement',
        resolve: {
          rights: rightsResolve
        }
      })
      .state('group', {
        url: '/channel-management/groups/:id',
        templateUrl: '/app/routes/channel-management/channel-management.template.html',
        controller: 'ChannelManagementController',
        controllerAs: 'channelManagement',
        resolve: {
          rights: rightsResolve
        }
      })
      .state('channelEdit', {
        url: '/channel-management/channel-edit/:id',
        templateUrl: '/app/routes/channel-management/channel-edit/channel-edit.template.html',
        controller: 'ChannelEditController',
        controllerAs: 'channelEdit',
        resolve: {
          channel: channelResolve,
          rights: rightsResolve,
          upsells: upsellResolve
        }
      })
      .state('newChannelGroup', {
        url: '/channel-management/new-channel-group',
        templateUrl: '/app/routes/channel-management/new-channel-group/new-channel-group.template.html',
        controller: 'NewChannelGroupController',
        controllerAs: 'newChannelGroup',
        resolve: {
          channelGroups: channelGroupsResolve,
          rights: rightsResolve
        }
      })
  }

  routes.$inject = ['$stateProvider'];

  angular.module('tapinApp.routes')
    .config(routes);

})();
