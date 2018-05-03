(function() {

  class PlanSelector {
    /*@ngInject*/
    constructor() {
    }

    choosePlan(plan) {
      if(!plan.disabled) {
        this.onChoose({ chosenPlan: plan });
      }
    }
  }

  angular.module('signUpApp.components')
    .component('planSelector', {
      bindings: {
        onChoose: '&',
        plans: '<'
      },
      controllerAs: 'planSelector',
      controller: PlanSelector,
      templateUrl: '/sign-up-app/components/plan-selector/plan-selector.template.html'
    });

})();
