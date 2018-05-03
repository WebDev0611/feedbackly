(function() {

  class EditDeviceForm {
    /*@ngInject*/
    constructor($window, $filter, UserStore, Toaster, messageConstants, deviceConstants, Languages, featureConstants) {
      this._$window = $window;
      this._$filter = $filter;
      this._uploader;
      this._Toaster = Toaster;
      this._messageConstants = messageConstants;
      this.type = this.type();
      this.channelTypes = deviceConstants.deviceTypes;
      this._UserStore = UserStore;
      this.currentUser = UserStore.getUserSignedIn();
      UserStore.getUserRights().then(rights => {
        this.rights = rights
        this.isRemoveable = (this.adminMode === 'true' || this.adminMode === true) || (this.currentUser.isOrganizationAdmin && (this.rights.availableFeatures || []).indexOf(featureConstants.CHANNEL_CREATION) > -1)
      })
      this.showLogo = this.hasLogo === 'true';
      
      this.Languages = Languages;
    }

    save(isValidForm) {
      if(isValidForm) {
        if(this._uploader !== undefined && this._uploader.queue.length > 0) {
          this._uploader.uploadItem(0);
        } else {
          this._update();
        }
      }
    }

    onLogo(uploader) {
      this._uploader = uploader;
      this._uploader.onSuccessItem = this._onLogoUpload.bind(this);
    }

    onRemoveLogo() {
      this.device.logo = null;
    }

    remove() {
      if(this._$window.confirm(this._$filter('translate')(this._messageConstants.CONFIRMATION))) {
        this.removing = true;

        this.device.remove()
          .then(() => {
            this.removing = false;
            this.onRemove({ device: this.device });
          });
      }
    }

    _update() {
      this.device.put()
        .then(() => {
          this._Toaster.success(this._messageConstants.SAVING_SUCCEEDED);
          this.onSave({ device: this.device });
          this._UserStore.onRightsChange().then()
        });
    }

    _onLogoUpload(item, response, status, headers) {
      this.device.logo = response.file;
      this._update();
    }
  }

  angular.module('tapinApp.components')
    .component('editDeviceForm', {
      bindings: {
        device: '<',
        hasLogo: '@',
        onSave: '&',
        onRemove: '&',
        type: '&',
        adminMode: '@',
        upsells: '<',
        organizationProfanityFilter: '<'
      },
      controller: EditDeviceForm,
      controllerAs: 'deviceForm',
      templateUrl: '/app/components/edit-device-form/edit-device-form.template.html'
    });

})();
