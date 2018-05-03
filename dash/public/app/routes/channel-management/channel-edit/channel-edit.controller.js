(function() {

  class ChannelEditController {
    /*@ngInject*/
    constructor(rights, channel, deviceConstants, $state, UserStore, upsells, featureConstants) {
      this._$state = $state;
      this.channelGroups = rights.devicegroupObjects;
      this.organizationProfanityFilter = rights.organizationProfanityFilter;
      this.channel = channel;
      this.allChannelsGroup = _.find(this.channelGroups, {is_all_channels_group: true});
      this.channelTypes = deviceConstants.deviceTypes;
      this._UserStore = UserStore;
      this.canCreateChannels = rights.availableFeatures.indexOf(featureConstants.CHANNEL_CREATION) > -1 || false;
      this.upsells = (upsells && upsells.length > 0) ? upsells : undefined;
    }
    onRemove(device) {
      this._$state.go('channel-management')
    }
  }

  angular.module('tapinApp.routes')
    .controller('ChannelEditController', ChannelEditController)

})();
