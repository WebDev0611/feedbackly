(function() {

  class ChannelsStore {
    constructor(PubSub) {
      this._PubSub = PubSub;

      this._channels = [];
      this._activeChannel = {};

      this._ON_CHANNELS_LIST_CHANGE = 'ON_CHANNELS_LIST_CHANGE';
      this._ON_CHANNEL_SAVE = 'ON_CHANNEL_SAVE';
    }

    onChange(scope, subscription) {
      var token = this._PubSub.subscribe(this._ON_CHANNELS_LIST_CHANGE, subscription);

      scope.$on('$destroy', () => this._PubSub.unsubscribe(token));
    }

    setActiveChannel(channel) {
      this._activeChannel = _.assign({}, channel);
    }

    getActiveChannel() {
      return this._activeChannel;
    }

    setChannels(channels) {
      this._channels = [...channels];

      this._PubSub.publish(this._ON_CHANNELS_LIST_CHANGE);
    }

    getChannels() {
      return this._channels;
    }

    addChannel(channel) {
      this._channels = [...this._channels, channel];

      this._PubSub.publish(this._ON_CHANNELS_LIST_CHANGE);
    }

    removeChannel(channelToRemove) {
      this._channels = [..._.filter(this._channels, channel => channel._id.toString() !== channelToRemove._id.toString())];

      this._PubSub.publish(this._ON_CHANNELS_LIST_CHANGE);
    }

    updateChannel(id, update) {
      var channel = _.find(this._channels, { _id: id });

      _.assign(channel, update);

      this._channels = [...this._channels];

      this._PubSub.publish(this._ON_CHANNELS_LIST_CHANGE);
    }
  }

  ChannelsStore.$inject = ['PubSub']

  angular.module('tapinApp.services')
    .service('ChannelsStore', ChannelsStore);

})();
