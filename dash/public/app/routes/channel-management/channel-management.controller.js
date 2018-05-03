(function() {

  class ChannelManagementController {
    /*@ngInject*/
    constructor($http, $filter, $state, $stateParams, Toaster, channelNames, rights,featureConstants) {
      this.channelGroup = $state.current.name === 'channel-management' ? _.find(rights.devicegroupObjects, {is_all_channels_group: true}) : _.find(rights.devicegroupObjects, {_id: $stateParams.id})
      this.channelGroups = rights.devicegroupObjects;
      this.channels = rights.deviceObjects;
      this._$http = $http;
      this._$filter = $filter;
      this._Toaster = Toaster;
      this._$state = $state;
      this._channelNames = channelNames;
      this.canCreateChannels = rights.availableFeatures.indexOf(featureConstants.CHANNEL_CREATION) > -1 || false;

      this.groupDevices = _.filter(this.channels, d => {
        return this.channelGroup.devices.indexOf(d._id) > -1;
      })

      this.channelsNotInGroup = _.filter(this.channels, d => {
        return this.channelGroup.devices.indexOf(d._id) === -1;
      })

      _.forEach(this.channels, c => {
        c.activeSurveyName = _.get(_.find(rights.activeSurveyNames, {_id: c.active_survey}), 'name');
      })

      this.allChannelsGroup = rights.allChannelsGroup;
      this.isAllChannelsGroup = this.allChannelsGroup && this.allChannelsGroup._id === this.channelGroup._id;
    }

    deleteChannelFromChannelGroup(id){
      var confirmText = this._$filter("translate")("Are you sure you want to remove channel from the channel group? All users who have rights to this group will no longer see the channel and its results.")
      if(confirm(confirmText)){
        this.channelGroup.devices = _.without(this.channelGroup.devices, id);
        this._$http.put(`/api/v2/channelgroups/${this.channelGroup._id}`, this.channelGroup)
        .then(success => {
          this._Toaster.success('Channel removed from group.');
          this._$state.reload();
        })
      }
    }

    channelName(name){
      return this._channelNames.channelName(name);
    }

    editGroup(group) {
      this.editingGroup = {
        _id: this.channelGroup._id,
        name: this.channelGroup.name
      };
    }
    saveEditingGroup() {
      this._$http.put(`/api/v2/channelgroups/${this.editingGroup._id}`, {name: this.editingGroup.name})
      .then(success => {
        this._$state.reload();
      });
    }

    deleteEditingGroup() {
      var confirmText = this._$filter("translate")("Are you sure you want to remove this channel group?");
      if(!confirm(confirmText)) return;
      this._$http.delete(`/api/v2/channelgroups/${this.editingGroup._id}`)
      .then(success => {
        this._$state.go('channel-management', {}, { reload: true });
      });
    }

  }

  angular.module('tapinApp.routes')
    .controller('ChannelManagementController', ChannelManagementController)

})();
