(function() {

  class SmsContactsStore {
    constructor(PubSub) {
      this._PubSub = PubSub;


      this._ON_SMS_CONTACTS_CHANGE = 'ON_SMS_CONTACTS_CHANGE';
    }

    onContactsChange(scope, subscription) {
      var token = this._PubSub.subscribe(this._ON_SMS_CONTACTS_CHANGE, subscription);

      scope.$on('$destroy', () => this._PubSub.unsubscribe(token));
    }

    addContact(contact) {
      this._PubSub.publish(this._ON_SMS_CONTACTS_CHANGE);
    }
  }

  SmsContactsStore.$inject = ['PubSub'];

  angular.module('tapinApp.services')
    .service('SmsContactsStore', SmsContactsStore);
})();
