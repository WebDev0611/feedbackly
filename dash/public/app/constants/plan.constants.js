(function() {

  var planConstants = {};

  planConstants.planTypes = {
    FREE_PLAN: 'FREE_PLAN',
    SMALL_PLAN: 'SMALL_PLAN',
    GROWTH_PLAN: 'GROWTH_PLAN',
    ENTERPRISE_PLAN: 'ENTERPRISE_PLAN'
  };

  angular.module('tapinApp')
    .constant('planConstants', planConstants);

})();
