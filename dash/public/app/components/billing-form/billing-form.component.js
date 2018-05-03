(function() {

  class BillingForm {
    constructor(stripe, Restangular, UserStore, Toaster) {
      this._stripe = stripe;
      this._Restangular = Restangular;
      this._UserStore = UserStore;
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
      var user = this._UserStore.getUserSignedIn();

      return this._Restangular
        .one('organizations', user.organization_id)
        .customPUT(params, 'billing');
    }

    _create(params) {
      var user = this._UserStore.getUserSignedIn();

      return this._Restangular
        .one('organizations', user.organization_id)
        .all('billing')
        .post(params);
    }

    _updateOrganizationsBillingInformation() {
      var user = this._UserStore.getUserSignedIn();

      return this._Restangular
        .one('organizations', user.organization._id)
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
            if(this.isNew === true) {
              return this._create({ paymentToken: res.id, billingInformation });
            } else {
              return this._update({ paymentToken: res.id, billingInformation });
            }
          })
          .then(() => {
            this.processing = false;
            this.onSave({});
          })
          .catch(error => {
            if(error.message) {
              this._Toaster.danger(error.message, { translate: false });
            } else {
              this._Toaster.danger('An error occured');
            }

            this.processing = false;
          });
      }
    }
  }

  BillingForm.$inject = ['stripe', 'Restangular', 'UserStore', 'Toaster'];

  angular.module('tapinApp.components')
    .component('billingForm', {
      bindings: {
        isNew: '<',
        onSave: '&'
      },
      controller: BillingForm,
      controllerAs: 'billing',
      templateUrl: '/app/components/billing-form/billing-form.template.html'
    });

})();
