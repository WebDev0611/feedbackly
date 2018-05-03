(function() {

  class EditChannelGroupForm {
    /*@ngInject*/
    constructor(deviceConstants) {
      this.channelTypes = deviceConstants.deviceTypes;
    }

    save(isValidForm) {
      if(isValidForm) {
        this.onSave({ channelGroup: this.channelGroup });
      }
    }

    saveChannelGroups() {
      this.onSaveChannelGroups({ chosenChannelGroups: _.filter(this.channelGroups, { chosen: true }) });
    }

    saveChannels() {
      this.onSaveChannels({ chosenChannels: _.filter(this.channels, { chosen: true }) });
    }
  }

  angular.module('tapinApp.components')
    .component('editChannelGroupForm', {
      bindings: {
        channelGroups: '<',
        channelGroup: '<',
        channels: '<',
        onSave: '&',
        onSaveChannelGroups: '&',
        onSaveChannels: '&',
        adminMode: '@'
      },
      controller: EditChannelGroupForm,
      controllerAs: 'editChannelGroupForm',
      templateUrl: '/app/components/edit-channel-group-form/edit-channel-group-form.template.html'
    });

})();
