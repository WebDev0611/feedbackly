(function() {

  class ResetPasswordSetPasswordController {
    constructor($stateParams, $state, Toaster, SignUpApi) {
      this._Toaster = Toaster;
      this._SignUpApi = SignUpApi;
      this._$stateParams = $stateParams;
      this._$state = $state;

      this.user = {};
    }

    submit(isValidForm) {
      if(isValidForm) {
        this.processing = true;

        this._SignUpApi.changePassword({ password: this.user.password, token: this._$stateParams.token })
          .then(() => {
            this.processing = false;
            this._Toaster.success('Your password has been reset');
            this._$state.go('signIn');
          })
          .catch(() => {
            this.processing = false;
            this._Toaster.danger('Something went wrong')
          });
      }
    }
  }

  ResetPasswordSetPasswordController.$inject = ['$stateParams', '$state', 'Toaster', 'SignUpApi'];

  angular.module('signUpApp')
    .controller('ResetPasswordSetPasswordController', ResetPasswordSetPasswordController);

})();
