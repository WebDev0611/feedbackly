(function() {

  class EmailDistribution {
    /*@ngInject*/
    constructor(Restangular, deviceConstants, schedulationConstants) {
      this._schedulationConstants = schedulationConstants;
      this._deviceTypes = deviceConstants.deviceTypes;
      this._Restangular = Restangular;
    }

    mapStoreToState(storeData) {
      var map = {};

      map.emailData = _.pick(storeData.data, ['allowUnsubscribe', 'header', 'footer', 'sender', 'subject']);
      map.date = _.get(storeData, 'schedulation.date');
      map.timeZone = _.get(storeData, 'schedulation.utcOffset');
      map.activationPlan = storeData.activationPlan || 'now';

      return map;
    }

    mapStateToStore(ref) {
      var chosenChannels = _.filter(ref.channels, channel => channel.chosen === true)
      var data = _.assign({ question: ref.question.plain(), surveyId: ref.survey._id, translation: ref.translation }, ref.emailData);

      var update = {
        type: this._deviceTypes.EMAIL,
        activeChannels: chosenChannels || [],
        activationPlan: ref.activationPlan,
        schedulation: undefined,
        data
      };

      if(ref.activationPlan === 'date') {
        update.schedulation = {
          date: ref.activationDay,
          utcOffset: ref.utcOffset,
          type: this._schedulationConstants.schedulationTypes.EMAIL,
          device_ids: chosenChannels || [],
          data
        };
      } else {
        update.schedulation = undefined;
      }

      return update;
    }

    sendTest(channelId, data) {
      return this.sendSingle(channelId, _.assign({}, data, { isTest: true }));
    }

    sendSingle(channelId, data) {
      return this._Restangular
        .one('mailinglists', channelId)
        .all('send')
        .post(data);
    }
  }

  angular.module('tapinApp.services')
    .service('EmailDistribution', EmailDistribution);

})();
