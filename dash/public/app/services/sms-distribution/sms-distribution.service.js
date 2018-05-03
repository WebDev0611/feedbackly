(function() {

  class SmsDistribution {
    /*@ngInject*/
    constructor(Restangular, deviceConstants, schedulationConstants) {
      this._schedulationConstants = schedulationConstants;
      this._deviceTypes = deviceConstants.deviceTypes;
      this._Restangular = Restangular;
    }

    mapStoreToState(storeData) {
      var map = {};

      map.smsData = _.pick(storeData.data, ['message', 'sender']);
      map.date = _.get(storeData, 'schedulation.date');
      map.timeZone = _.get(storeData, 'schedulation.utcOffset');
      map.activationPlan = storeData.activationPlan || 'now';

      return map;
    }

    mapStateToStore(ref) {
      var chosenChannels = _.filter(ref.channels, channel => channel.chosen === true)
      var data = _.assign({ surveyId: ref.survey._id }, ref.smsData);

      var update = {
        type: this._deviceTypes.SMS,
        activeChannels: chosenChannels || [],
        activationPlan: ref.activationPlan,
        schedulation: undefined,
        data
      };

      if(ref.activationPlan === 'date') {
        update.schedulation = {
          date: ref.activationDay,
          utcOffset: ref.utcOffset,
          type: this._schedulationConstants.schedulationTypes.SMS,
          device_ids: chosenChannels || [],
          data
        };
      } else {
        update.schedulation = undefined;
      }

      return update;
    }

    sendTest(channelId, phoneNumber, data) {
      var data = _.assign(data, { phoneNumber, isTest: true });

      return this.sendSingle(channelId, data);
    }

    sendSingle(channelId, data) {
      return this._Restangular.one('sms_channels', channelId)
        .all('send')
        .post(data);
    }
  }

  angular.module('tapinApp.services')
    .service('SmsDistribution', SmsDistribution);

})();
