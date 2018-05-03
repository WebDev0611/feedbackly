(function(){

  class SignUpApi {
    /*@ngInject*/
    constructor($http) {
      this._$http = $http;
    }

    signIn(user, options = {}) {
      var query = options.organizationId !== undefined
        ? `?organization=${options.organizationId}`
        : '';

      return this._$http.post(`/api/users/login${query}`, user);
    }

    signUp(user, options = {}) {
      return this._$http.post('/api/users/register', user, options);
    }

    sendPasswordResetEmail(user) {
      return this._$http.post('/api/user/send_password_reset_link', { email : user.email });
    }

    verifyToken(token) {
      return this._$http.post('/api/user/verify_email_token', { token: token });
    }

    changePassword(params) {
      return this._$http.post('/api/user/change_password', { token: params.token, password: params.password });
    }

    sendBillingInformation(params) {
      return this._$http.post(`/api/organizations/${params.organizationId}/billing/token`, params);
    }

    updateBillingInformation(params) {
      return this._$http.put(`/api/organizations/${params.organizationId}/billing/token`, params);
    }

    sendEmailConfirmation(email) {
      return this._$http.post('/api/users/send_email_confirmation', { email });
    }
  }

  angular.module('signUpApp.services')
    .service('SignUpApi', SignUpApi);

})();
