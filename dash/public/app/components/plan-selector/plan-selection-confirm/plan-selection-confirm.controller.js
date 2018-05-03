(function() {

  class PlanSelectionConfirmController {
    /*@ngInject*/
    constructor($scope) {
      this._$scope = $scope;
    }

    confirm() {
      this._$scope.$parent.planSelector.confirmPlan();
    }
  }

  angular.module('tapinApp.components')
    .controller('PlanSelectionConfirmController', PlanSelectionConfirmController);

})();
