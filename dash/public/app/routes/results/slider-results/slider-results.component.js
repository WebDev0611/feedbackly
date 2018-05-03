(function() {

  class SliderResults extends ResultsComponent {
    /*@ngInject*/
    constructor($scope, ResultsApi, ResultsStore, ChartFactory, colorConstants) {
      super($scope, ResultsStore);

      this._ResultsApi = ResultsApi;
      this._ResultsStore = ResultsStore;
      this._ChartFactory = ChartFactory;
      this._colorConstants = colorConstants;

      this._initializeCharts();
    }

    _initializeCharts() {
      this._ResultsApi.getQuestionResults(_.assign(this._filter, { question: this.question }))
        .then(results => {
          this.colorMap = this._randomColorMap(_.map(results.totals.regular, total => total.name), this._colorConstants.RANDOM_COLORS)

          this.question.charts = this._ChartFactory.createSliderCharts(results.charts,
            { colorMapper: this.colorMap, smallScale: _.get(this.question,'opts.smallScale') });
          this.question.totals = results.totals;

          this._initializeSettings();
        });
    }
  }

  angular.module('tapinApp.components')
    .component('sliderResults', {
      bindings: {
        question: '<',
        compare: '@'
      },
      controller: SliderResults,
      controllerAs: 'sliderResults',
      templateUrl: '/app/routes/results/slider-results/slider-results.template.html'
    });

})();
