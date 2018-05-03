(function() {

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

  function channelsResolve() {
    var resolve = (UserStore) => {
      return UserStore.getUserRights()
      .then(rights => {
        var devices = rights.deviceObjects;
        return devices
      })
    }

    resolve.$inject = ['UserStore'];

    return resolve;
  }

  function upsellListResolve($http) {
    return $http.get('/api/v2/upsells').then(res => {
      return res.data
    })
  }

  upsellListResolve.$inject = ['$http'];


  function upsellResolve($http, $stateParams) {
    var id = $stateParams.id;
    return $http.get('/api/v2/upsells/' + id).then(res => {
      return res.data
    })
  }

  upsellResolve.$inject = ['$http', '$stateParams'];

  function emptyResolver(){
    return undefined;
  }

  function routes($stateProvider) {
    $stateProvider
      .state('upsells', {
        url: '/upsells',
        templateUrl: '/app/routes/upsells/upsell-list/upsell-list.template.html',
        controller: 'UpsellListController',
        controllerAs: 'upsellList',
        resolve: {
          upsells: upsellListResolve,
          channelTree: channelTreeResolve(),
          channels: channelsResolve()
        }
      })
      .state('upsells-new', {
        url: '/upsells/new',
        templateUrl: '/app/routes/upsells/upsell-editor/upsell-editor.template.html',
        controller: 'UpsellEditorController',
        controllerAs: 'upsellEditor',
        resolve: {
          upsell: emptyResolver
        }
      })
      .state('upsells-edit', {
        url: '/upsells/:id',
        templateUrl: '/app/routes/upsells/upsell-editor/upsell-editor.template.html',
        controller: 'UpsellEditorController',
        controllerAs: 'upsellEditor',
        resolve: {
          upsell: upsellResolve
        }
      })
  }
  routes.$inject = ['$stateProvider'];

  angular.module('tapinApp.routes')
    .config(routes);

})();
