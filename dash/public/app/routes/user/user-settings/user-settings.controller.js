(function() {

  class UserSettingsController {
    /*@ngInject*/
    constructor($scope, $window, UserStore, Restangular, Toaster, messageConstants, Languages, $http) {
      this._$window = $window;
      this._UserStore = UserStore;
      this._Toaster = Toaster;
      this._Restangular = Restangular;
      this._messageConstants = messageConstants;
      this._$http = $http;
      this.availableLanguages = Languages.getDashboardTranslations();
      this.user = this._UserStore.getUserSignedIn();

      this._originalLocale = _.get(this.user, 'settings.locale');

      this._UserStore.onSignedInUserChange($scope, () => { this.user = this._UserStore.getUserSignedIn() });
    }

    saveSettings(isValidForm) {
      
      if(isValidForm) {
        var attributes = _.pick(this.user, ['displayname', 'settings']);

        this._$http.put('/api/v2/users/' + this.user._id, attributes)
          .then(success => {
            this._UserStore.updateUserSignedIn(attributes);

            if(this._originalLocale !== _.get(attributes, 'settings.locale')) {
              this._$window.location.reload();
            } else {
              this._Toaster.success(this._messageConstants.SAVING_SUCCEEDED);
            }  
          }, error => {
              this._Toaster.error('Something went wrong')
          });
      }
    }

    savePassword(isValidForm) {
      if(isValidForm) {
        this._$http.put('/api/v2/users/' + this.user._id, { password: this.user.password })
        .then(success => {
            this._Toaster.success(this._messageConstants.SAVING_SUCCEEDED);
        },
        
        error => {
          this._Toaster.error('Something went wrong')
        });
      }
    }
  }

  angular.module('tapinApp.routes')
    .controller('UserSettingsController', UserSettingsController);

})();
