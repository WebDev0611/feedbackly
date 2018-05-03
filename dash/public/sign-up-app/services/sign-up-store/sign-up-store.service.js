(function() {

  class SignUpStore {
    /*@ngInject*/
    constructor($localStorage) {
      this._userToken;
      this._loginToken;
      this._user;
      this._billingOrganization;
      this._organizations = [];

      this._$localStorage = $localStorage;
    }

    setUser(user) {
      this._user = _.assign({}, user);
    }

    saveUserToStorage(user) {
      delete user.password;

      this._$localStorage.user = user;
    }

    setBillingOrganization(organization) {
      this._billingOrganization = organization;
    }

    setLoginToken(token) {
      this._loginToken = token;
    }

    setOrganizations(organizations) {
      this._organizations = [...organizations];
    }

    getOrganizations() {
      return this._organizations;
    }

    getUser() {
      return this._user;
    }

    getBillingOrganization() {
      return this._billingOrganization;
    }

    getLoginToken() {
      return this._loginToken;
    }

    getUserToken() {
      return this._userToken;
    }

    setUserToken(token) {
      this._userToken = token;
    }
  }

  angular.module('signUpApp.services')
    .service('SignUpStore', SignUpStore);

})();
