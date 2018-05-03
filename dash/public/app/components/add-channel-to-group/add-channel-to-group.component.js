(function() {

  class AddChannelToGroup {
    /*@ngInject*/
    constructor($http, Toaster, UserStore, $state) {
      this._$http = $http;
      this.addChannelToGroups = {};
      this._id = this.channelGroup._id;
      this._Toaster = Toaster;
      this._UserStore = UserStore;
      this._$state = $state;
    }

    _selected(){
      var keys = _.keys(this.addChannelToGroups);
      return _.filter(keys, key => {return this.addChannelToGroups[key]})
    }

    selectedLength(){
      return this._selected().length
    }

    save(){
      this.channelGroup.devices = [...this.channelGroup.devices,...this._selected()];
      this._$http.put('/api/v2/channelgroups/' + this._id, this.channelGroup)
      .then(success => {
        this._Toaster.success("Channels added to group successfully.")
        this._UserStore.onRightsChange()
        .then(() => {
          this._$state.reload();
        })
      })
    }
  }

  angular.module('tapinApp.components')
    .component('addChannelToGroup', {
      bindings: {
        channels: '<',
        channelGroup: '<'
      },
      controller: AddChannelToGroup,
      controllerAs: 'addChannelToGroup',
      templateUrl: '/app/components/add-channel-to-group/add-channel-to-group.template.html'
    })
})();
