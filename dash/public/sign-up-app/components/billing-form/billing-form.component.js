(function() {

  class BillingForm {
    constructor(stripe, Restangular, SignUpApi, Toaster) {
      this._stripe = stripe;
      this._Restangular = Restangular;
      this._SignUpApi = SignUpApi;
      this._Toaster = Toaster;

      this.expirationRegexp = /^[0-9]{2}\/[0-9]{4}$/;
      this.billingInformation = {};

      this.billingDetails = {};

      this.isInEU = false;
    }

    onSelectCountry(country) {
      this.isInEU = (window.EU_COUNTRY_CODES || {})[country] !== undefined;

      this.billingDetails.address_country = country;
    }

    _getPayment() {
      var payment = {
        number: this.billingInformation.cardNumber,
        cvc: this.billingInformation.cvc,
        exp_month: this.billingInformation.expiration.split('/')[0],
        exp_year: this.billingInformation.expiration.split('/')[1],
        name: this.billingInformation.fullName
      };

      return _.assign({}, payment, this.billingDetails);
    }

    _update(params) {
      return this._SignUpApi.updateBillingInformation(params);
    }

    _create(params) {
      return this._SignUpApi.sendBillingInformation(params);
    }

    save(isValidForm) {
      if(isValidForm) {
        this.processing = true;

        var billingInformation = {
          country: this.billingDetails.address_country,
          taxId: this.billingInformation.billing_tax_id,
          city: this.billingDetails.address_city,
          address: this.billingDetails.address_line1,
          fullName: this.billingInformation.fullName,
          postalCode: this.billingDetails.address_zip
        };

        this._stripe.card.createToken(this._getPayment())
          .then(res => {
            var params = { authenticationToken: this.authenticationToken, paymentToken: res.id, billingInformation, organizationId: this.organizationId };

            if(this.isNew === true) {
              return this._create(params);
            } else {
              return this._update(params);
            }
          })
          .then(() => {
            this.processing = false;
            this.onSave({});
          })
          .catch(error => {
            if(error.message) {
              this._Toaster.danger(error.message);
            } else {
              this._Toaster.danger('Something went wrong');
            }

            this.processing = false;
          });
      }
    }

    skip() {
      this.onSkip({});
    }
  }

  BillingForm.$inject = ['stripe', 'Restangular', 'SignUpApi', 'Toaster'];

  angular.module('signUpApp.components')
    .component('billingForm', {
      bindings: {
        isNew: '<',
        onSave: '&',
        authenticationToken: '<',
        organizationId: '<',
        skipIsDisabled: '<',
        onSkip: '&',
      },
      controller: BillingForm,
      controllerAs: 'billing',
      templateUrl: '/sign-up-app/components/billing-form/billing-form.template.html'
    });

})();
