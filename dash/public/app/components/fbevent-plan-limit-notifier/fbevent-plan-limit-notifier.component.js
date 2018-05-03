(function() {

  class FbeventPlanLimitNotifier {
  }

  angular.module('tapinApp.components')
    .component('fbeventPlanLimitNotifier', {
      controller: FbeventPlanLimitNotifier,
      controllerAs: 'fbeventLimit',
      bindings: {
        show: '<',
        planLimit: '<',
        count: '<',
        showUpgradeLink: '<'
      },
      templateUrl: '/app/components/fbevent-plan-limit-notifier/fbevent-plan-limit-notifier.template.html'
    });

})();
