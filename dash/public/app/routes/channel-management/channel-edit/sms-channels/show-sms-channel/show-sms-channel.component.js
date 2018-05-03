(function() {

  class ShowSmsChannelController {
    /*@ngInject*/
    constructor(modal, Toaster, SmsContactsStore, ChannelsStore, deviceConstants, messageConstants, $filter, $window, $state, Restangular, $scope) {
      this.type = deviceConstants.deviceTypes.SMS;

      this._modal = modal;
      this._Toaster = Toaster;
      this._SmsContactsStore = SmsContactsStore;
      this._$filter = $filter;
      this._$window = $window;
      this._$state = $state;
      this._Restangular = Restangular;
      this._ChannelsStore = ChannelsStore;
      this._messageConstants = messageConstants

      this.page = 1;
      this.pageSize = 20;

      this._ChannelsStore.setActiveChannel(this.channel);
      this._getContacts();

      this._SmsContactsStore.onContactsChange($scope, () => this._getContacts());
    }

    editContact(contact) {
      this.editingContact = contact;
    }
    saveEditContact() {
      console.log("Called");
      this._Restangular
        .one('sms_contacts', this.editingContact._id)
        .customPUT(this.editingContact)
        .then(() => {
          this._Toaster.success(this._messageConstants.SAVING_SUCCEEDED);
          this._SmsContactsStore.addContact({});
        }).catch(() => {
          this._Toaster.danger('Error');
        });


    }


    removeContact(contact) {
      if(this._$window.confirm(this._$filter('translate')('Are you sure?'))) {
        this._Restangular
          .one('sms_contacts', contact._id)
          .remove()
          .then(() => this._getContacts());
      }
    }

    onPageChange(page) {
      this.page = page;

      this._getContacts();
    }

    onRemove(device) {
      this._$state.go('channels.smsChannels.allChannels');
    }

    addContacts() {
      this._modal.open({
        templateUrl: '/app/routes/channel-management/channel-edit/sms-channels/show-sms-channel/add-sms-contacts/add-sms-contacts.template.html',
        controller: 'AddSmsContactsController',
        controllerAs: 'addContacts',
        fixedFooter: false
      });
    }


    _getContacts() {
      this._Restangular
        .one('sms_channels', this.channel._id)
        .one('contacts')
        .get({ skip: (this.page - 1) * this.pageSize, limit: this.pageSize })
        .then(data => {
          this.contactsCount = data.count;
          this.contacts = data.list;
          this._getMeta();
        })
    }

    _getMeta(){
      const metas = this.contacts.map(c => c.meta)
      let usedMetaKeys = metas.map(obj => _.keys(obj));
      usedMetaKeys = _.flatten(usedMetaKeys);
      this.usedMetaKeys = _.uniq(usedMetaKeys);
    }
  }

  angular.module('tapinApp.components')
    .component('showSmsChannel', {
      bindings: {
        channel: '='
      },
      controller: ShowSmsChannelController,
      controllerAs: 'showSms',
      templateUrl: '/app/routes/channel-management/channel-edit/sms-channels/show-sms-channel/show-sms-channel.template.html'
    });

})();
