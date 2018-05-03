(function() {

  class channelGroupList {
    /*@ngInject*/
    constructor(){

    }
  }

    angular.module('tapinApp.components')
      .component('channelGroupList', {
        bindings: {
          allChannelsGroup: "=",
          channelGroups: "=",
          canCreateChannels: "<"
        },
        controller: channelGroupList,
        controllerAs: 'channelGroupList',
        templateUrl: '/app/components/channel-group-list/channel-group-list.template.html'
      });

})()
