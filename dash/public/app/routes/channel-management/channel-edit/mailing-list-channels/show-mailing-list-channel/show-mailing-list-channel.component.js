(function() {

  class ShowMailingListChannelController {
    /*@ngInject*/
    constructor(modal, Toaster, MailingListsStore, ChannelsStore, deviceConstants, messageConstants, $filter, $window, $state, Restangular, $scope) {
      this.type = deviceConstants.deviceTypes.EMAIL;
      this._modal = modal;
      this._Toaster = Toaster;
      this._MailingListsStore = MailingListsStore;
      this._$filter = $filter;
      this._$window = $window;
      this._$state = $state;
      this._Restangular = Restangular;
      this._ChannelsStore = ChannelsStore;
      this._messageConstants = messageConstants;
      this.page = 1;
      this.pageSize = 20;

      this._ChannelsStore.setActiveChannel(this.channel);

      this._getAddresses();

      this._MailingListsStore.onAddressesChange($scope, () => this._getAddresses());
    }

    removeAddress(address) {
      if(this._$window.confirm(this._$filter('translate')('Are you sure?'))) {
        this._Restangular
          .one('mailinglist_addresses', address._id)
          .remove()
          .then(() => this._getAddresses());
      }
    }

    editAddress(contact) {
      this.editingAddress = contact;
    }

    saveEditAddress() {
      this._Restangular
        .one('mailinglist_addresses', this.editingAddress._id)
        .customPUT(this.editingAddress)
        .then(() => {
          this._Toaster.success(this._messageConstants.SAVING_SUCCEEDED);
          this._MailingListsStore.addAddress({});
        }).catch(() => {
          this._Toaster.danger('Error');
        });
    }

    onPageChange(page) {
      this.page = page;

      this._getAddresses();
    }

    onRemove(device) {
      this._$state.go('channels.mailingLists.allChannels');
    }

    addAddresses() {
      this._modal.open({
        templateUrl: '/app/routes/channel-management/channel-edit/mailing-list-channels/show-mailing-list-channel/add-mailing-list-addresses/add-mailing-list-addresses.template.html',
        controller: 'AddMailingListAddressesController',
        controllerAs: 'addAddresses',
        fixedFooter: false
      });
    }

    _getAddresses() {
      this._Restangular
        .one('mailinglists', this.channel._id)
        .one('addresses')
        .get({ skip: (this.page - 1) * this.pageSize, limit: this.pageSize })
        .then(data => {
          this.addressCount = data.count;
          this.addresses = data.list;
          this._getMeta()
        })
    }

    _getMeta(){
      const metas = this.addresses.map(c => c.meta)
      let usedMetaKeys = metas.map(obj => _.keys(obj));
      usedMetaKeys = _.flatten(usedMetaKeys);
      this.usedMetaKeys = _.uniq(usedMetaKeys);
    }
  }

  angular.module('tapinApp.components')
    .component('showMailingListChannel', {
      bindings: {
        channel: '='
      },
      controller: ShowMailingListChannelController,
      controllerAs: 'showMailingList',
      templateUrl: '/app/routes/channel-management/channel-edit/mailing-list-channels/show-mailing-list-channel/show-mailing-list-channel.template.html'
    });

})();
