(function() {

  class NewChannelGroupController {
    /*@ngInject*/
    constructor(channelGroups, $http, $state, UserStore, Toaster, featureConstants ){
      this.channelGroups = channelGroups;
      this.allChannelsGroup = _.find(this.channelGroups, {is_all_channels_group: true});
      this.channelGroup = {name: ''}
      this._$http = $http;
      this._$state = $state;
      this._UserStore = UserStore;
      this._Toaster = Toaster;
      this.canCreateChannels = false;
      this._UserStore.getUserRights().then(rights => {
        this.canCreateChannels = rights.availableFeatures.indexOf(featureConstants.CHANNEL_CREATION) > -1 || false;
      })
    }

    save(){
      if(this.canCreateChannels){
        this._$http.post('/api/v2/channelgroups', this.channelGroup)
        .then(response => {
          var id = response.data._id;
          this._Toaster.success("Successfully created the channel group.")
          this._UserStore.onRightsChange()
          .then(() => {
            this._$state.go("group", {id: id});
          })

        })
      } else {
        this._Toaster.neutral("You have to be an organization admin to create channel groups.")
      }

    }
  }


  angular.module('tapinApp.routes')
    .controller('NewChannelGroupController', NewChannelGroupController)

})();
