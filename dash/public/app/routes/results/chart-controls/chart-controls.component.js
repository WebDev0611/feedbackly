(function() {

  class ChartControls {
    /*@ngInject*/
    constructor($scope) {
      $scope.$watch(() => this.unit, (newUnit, oldUnit) => {
        if(newUnit) this.onUnitChange({ unit: newUnit });
      });

      $scope.$watch(() => this.accuracy, (newAccuracy, oldAccuracy) => {
        if(newAccuracy) this.onAccuracyChange({ accuracy: newAccuracy });
      });

      $scope.$watch(() => this.chartType, (newType, oldType) => {
        if(newType) this.onChartTypeChange({ chartType: newType });
      });
    }
  }

  angular.module('tapinApp.components')
    .component('chartControls', {
      bindings: {
        unit: '<',
        accuracy: '<',
        chartType: '<',
        onUnitChange: '&',
        onAccuracyChange: '&',
        onChartTypeChange: '&'
      },
      controller: ChartControls,
      controllerAs: 'chartControls',
      templateUrl: '/app/routes/results/chart-controls/chart-controls.template.html'
    });

})();
