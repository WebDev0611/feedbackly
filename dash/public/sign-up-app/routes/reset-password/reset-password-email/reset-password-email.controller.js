(function() {

  class ResetPasswordEmailController {
    constructor(Toaster, SignUpApi) {
      this._Toaster = Toaster;
      this._SignUpApi = SignUpApi;

      this.user = {};
    }

    submit(isValidForm) {
      if(isValidForm) {
        this.processing = true;

        this._SignUpApi.sendPasswordResetEmail(this.user)
          .then(() => {
            this.processing = false;
            this._Toaster.success(`Password reset link has been sent to ${this.user.email}`);
          })
          .catch(res => {
            this.processing = false;
            this._Toaster.danger(res.data.error || 'Something went wrong')
          });
      }
    }
  }

  ResetPasswordEmailController.$inject = ['Toaster', 'SignUpApi'];

  angular.module('signUpApp.routes')
    .controller('ResetPasswordEmailController', ResetPasswordEmailController);

})();
