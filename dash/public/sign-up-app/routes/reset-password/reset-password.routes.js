(function() {

  function verifyPasswordToken($stateParams, $state, Toaster, SignUpApi) {
    var token = $stateParams.token;

    return SignUpApi.verifyToken(token)
      .then(res => true)
      .catch(res => {
        Toaster.danger('Your link is either invalid or expired, please request a new one');
        $state.go('resetPassword.email');
      });
  }

  verifyPasswordToken.$inject = ['$stateParams', '$state', 'Toaster', 'SignUpApi'];

  function routes($stateProvider) {
    $stateProvider
      .state('resetPassword', {
        url: '/reset-password',
        templateUrl: '/sign-up-app/routes/reset-password/reset-password.template.html',
        abstract: true
      })
      .state('resetPassword.email', {
        url: '',
        templateUrl: '/sign-up-app/routes/reset-password/reset-password-email/reset-password-email.template.html',
        controller: 'ResetPasswordEmailController',
        controllerAs: 'resetPasswordEmail'
      })
      .state('resetPassword.setPassword', {
        url: '/:token',
        templateUrl: '/sign-up-app/routes/reset-password/reset-password-set-password/reset-password-set-password.template.html',
        controller: 'ResetPasswordSetPasswordController',
        controllerAs: 'setPassword',
        resolve: {
          isValidToken: verifyPasswordToken
        }
      });
  }

  routes.$inject = ['$stateProvider'];

  angular.module('signUpApp.routes')
    .config(routes);

})();
