(function() {

  var organizationConstants = {};

  organizationConstants.segments = {
    SOLUTION_SALES: 'SOLUTION_SALES',
    SELF_SIGNUP: 'SELF_SIGNUP',
    TEST: 'TEST'
  };

  angular.module('tapinApp')
    .constant('organizationConstants', organizationConstants);

})();
