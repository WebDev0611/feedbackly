(function() {

  class AddChannel {
    /*@ngInject*/
    constructor(deviceConstants, $http, Toaster, $state, channelNames) {
      this._$http = $http;
      this.deviceTypes = deviceConstants.deviceTypes;
      this.channel = {
        name: '',
        type: 'LINK'
      }
      this.putInDevicegroups = {};
      this._Toaster = Toaster;
      this._$state = $state;
      this._channelNames = channelNames;
    }

    _selected(){
      var keys = _.keys(this.putInDevicegroups);
      return _.filter(keys, key => {return this.putInDevicegroups[key]});
    }

    save(){
      this.channel.putInChannelGroups = this._selected();
      this._$http.post("/api/v2/channels", this.channel)
      .then(success => {
        this._Toaster.success("Successfully created a channel.")
        this._$state.go("channelEdit", {id: success.data._id})
      })
    }

    channelName(name){
      return this._channelNames.channelName(name);
    }
  }

  angular.module('tapinApp.components')
    .component('addChannel', {
      bindings: {
        channelGroups: "<"
      },
      controller: AddChannel,
      controllerAs: 'addChannel',
      templateUrl: '/app/components/add-channel/add-channel.template.html'
    })
})();
