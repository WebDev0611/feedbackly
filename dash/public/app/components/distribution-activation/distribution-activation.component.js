(function() {

  class DistributionActivation {
    constructor() { }

    chooseActivationPlan() {
      this.onActivationPlanChange({ plan: this.activationPlan });
    }
  }

  angular.module('tapinApp.components')
    .component('distributionActivation', {
      bindings: {
        activationPlan: '<',
        onDateChange: '&',
        onTimeZoneChange: '&',
        onActivationPlanChange: '&',
        timeZone: '<',
        date: '<',
        nowTitle: '@',
        dateTitle: '@'
      },
      controller: DistributionActivation,
      controllerAs: 'distributionActivation',
      templateUrl: '/app/components/distribution-activation/distribution-activation.template.html'
    })

})();
