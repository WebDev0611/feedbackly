(function() {

  class PlanSelector {
    /*@ngInject*/
    constructor(modal, $scope) {
      this._modal = modal;
      this._$scope = $scope;
    }

    confirmPlan() {
      this.onChoosePlan({ plan: this.chosenPlan });
    }

    choosePlan(plan, disabled) {
      if(!disabled && plan !== this.activePlan) {
        this.chosenPlan = plan;

        this._modal.open({
          templateUrl: '/app/components/plan-selector/plan-selection-confirm/plan-selection-confirm.template.html',
          controller: 'PlanSelectionConfirmController',
          controllerAs: 'confirmPlan',
          scope: this._$scope
        });
      }
    }
  }

  angular.module('tapinApp.components')
    .component('planSelector', {
      controller: PlanSelector,
      controllerAs: 'planSelector',
      bindings: {
        paidPlansDisabled: '<',
        onChoosePlan: '&',
        activePlan: '<'
      },
      templateUrl: '/app/components/plan-selector/plan-selector.template.html'
    });

})();
