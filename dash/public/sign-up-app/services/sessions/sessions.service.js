(function() {

  class Sessions {
    /*@ngInject*/
    constructor(SignUpStore, SignUpApi, $window, $q) {
      this._SignUpApi = SignUpApi;
      this._SignUpStore = SignUpStore;
      this._$q = $q;
      this._$window = $window;
    }

    signIn() {
      var loginToken = this._SignUpStore.getLoginToken();

      if(loginToken !== undefined) {
        return this._SignUpApi.signIn({ token: loginToken })
          .then(res => {
            this._SignUpStore.saveUserToStorage(res.data);
            this._$window.location.replace('/app');
          });
      } else {
        return this._$q.reject();
      }
    }
  }

  angular.module('signUpApp.services')
    .service('Sessions', Sessions);

})();
