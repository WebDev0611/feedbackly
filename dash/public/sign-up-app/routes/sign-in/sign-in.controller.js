(function() {

  class SignInController {
    /*@ngInject*/
    constructor(SignUpApi, Toaster, UrlParser, SignUpStore, $localStorage, $window, $filter, $state) {
      this._SignUpApi = SignUpApi;
      this._SignUpStore = SignUpStore;
      this._Toaster = Toaster;
      this._$localStorage = $localStorage;
      this._$window = $window;
      this._$filter = $filter;
      this._$state = $state;

      this.credentials = {};

      this.storage = $localStorage.$default({
        rememberMe: false
      });

      var redirectTrigger = UrlParser.getParameterValue('redirect_trigger') || '';

      if(redirectTrigger.toUpperCase() === 'EMAIL_CONFIRMED') {
        this._Toaster.success('Your email address has been confirmed. Please, log in');
      } else if(redirectTrigger.toUpperCase() === 'EMAIL_CONFIRMATION_FAILED') {
        this._Toaster.danger('Your email confirmation link is either invalid or expired. Please, log in again');
      }
    }

    submit(isValidForm) {
      if(isValidForm) {
        this.isAdmin = false;
        this.organizations = [];
        this.errorReason = undefined;
        this._billingActionType = undefined;

        this.processing = true;

        var options = this.chosenOrganization
          ? { organizationId: this.chosenOrganization }
          : {};

        this._SignUpApi.signIn(_.assign({}, this.credentials, { email: (this.credentials.email || '').toLowerCase(), rememberMe: this.storage.rememberMe }), options)
          .then(res => this._onSignInSuccess(res))
          .catch(res => this._onSignInError(res));
      }
    }

    goToBilling() {
      this._$state.go('signUp.billing', { trialDisabled: true, actionType: this._billingActionType, nextState: 'signIn' });
    }

    _onSignInSuccess(res) {
      this._SignUpStore.saveUserToStorage(res.data);
      this._$window.location.replace('/app');
    }

    _onSignInError(res) {
      this.processing = false;

      var error = res.data.error;
      var errorId = res.data.id;
      var token = res.data.token;
      var errorOrganization = res.data.errorOrganization;
      var organizations = res.data.organizations;

      this.organizations = res.data.organizations;

      if(errorId === 'EMAIL_NOT_CONFIRMED') {
        this._SignUpStore.setUser({ email: this.credentials.email });
        this._Toaster.danger(error);

        this._$state.go('signUp.confirmEmail');
      } else if(['TRIAL_ENDED', 'CANCELED_SUBSCRIPTION', 'DELIQUENT'].indexOf(errorId) >= 0) {
        this._onPaymentError({ token, errorId, error, errorOrganization })

        if(token) {
          this.isAdmin = true;
        }
      } else {
        this._Toaster.danger(error || 'Something went wrong');
      }
    }

    _onPaymentError(options) {
      this._Toaster.danger(options.error);

      if(options.token) {
        this._SignUpStore.setUserToken(options.token);
        this._SignUpStore.setBillingOrganization(options.errorOrganization._id);
      }

      switch(options.errorId) {
        case 'CANCELED_SUBSCRIPTION':
          this.errorReason = `The subscription of ${options.errorOrganization.name} has been canceled and we require your current billing information to proceed.`;
          this._billingActionType = 'UPDATE';
          break;
        case 'DELIQUENT':
          this.errorReason = `We couldn\'t charge the current credit card of ${options.errorOrganization.name} and we require your current billing information to proceed.`;
          this._billingActionType = 'UPDATE';
          break;
        case 'TRIAL':
          this.errorReason = `The trial of ${options.errorOrganization.name} endend and we require your billing information to proceed.`;
          this._billingActionType = 'CREATE';
          break;
        default:
          this._billingActionType = 'CREATE';
      }
    }
  }

  angular.module('signUpApp.routes')
    .controller('SignInController', SignInController);

})();
