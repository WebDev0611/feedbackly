(function() {

  class MailingListsStore {
    constructor(PubSub) {
      this._PubSub = PubSub;


      this._ON_MAILING_LIST_ADDRESSES_CHANGE = 'ON_MAILING_LISTS_ADDRESSES_CHANGE';
    }

    onAddressesChange(scope, subscription) {
      var token = this._PubSub.subscribe(this._ON_MAILING_LISTS_ADDRESSES_CHANGE, subscription);

      scope.$on('$destroy', () => this._PubSub.unsubscribe(token));
    }

    addAddress(address) {
      this._PubSub.publish(this._ON_MAILING_LISTS_ADDRESSES_CHANGE);
    }
  }

  MailingListsStore.$inject = ['PubSub']

  angular.module('tapinApp.services')
    .service('MailingListsStore', MailingListsStore);

})();
