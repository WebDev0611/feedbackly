(function() {

  class AddDeviceForm {
    /*@ngInject*/
    constructor(Restangular, UserStore, $state, deviceConstants, modal, $window, $scope) {
      this._Restangular = Restangular;
      this._$state = $state;
      this._deviceConstants = deviceConstants;
      this._modal = modal;
      this._$scope = $scope;
      this._signedInUser = UserStore.getUserSignedIn();

      this.newDevice = { name: '', type: this.type };
    }

    save(isValidForm) {
      if(!isValidForm) {
        return;
      }

      this.create()
    }

    create() {
      this.processing = true;

      this._Restangular
        .all('devices')
        .post(this.newDevice)
        .then(device => {
          this.processing = false;

          this.onAdd({ channel: device });
        })
        .catch(err => {
          this.processing = false;

          if(_.isFunction(this.onError)) {
            this.onError({ error: err });
          }
        });
    }
  }

  angular.module('tapinApp.components')
    .component('addDeviceForm', {
      bindings: {
        type: '<',
        organization: '<',
        onAdd: '&',
        onError: '&',
        showDisclaimer: '@',
        confirm: '@'
      },
      controller: AddDeviceForm,
      controllerAs: 'deviceForm',
      templateUrl: '/app/components/add-device-form/add-device-form.template.html'
    });

})();
