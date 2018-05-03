(function() {

  class ImageResults extends ResultsComponent {
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

          var channelNameList = results.channelList;
          this.question.charts = this._ChartFactory.createImageCharts(results.charts, channelNameList, { colorMapper: this.colorMap });
          this.question.totals = results.totals;

          this._initializeSettings();
        });
    }
  }

  angular.module('tapinApp.components')
    .component('imageResults', {
      bindings: {
        question: '<',
        compare: '@'
      },
      controller: ImageResults,
      controllerAs: 'imageResults',
      templateUrl: '/app/routes/results/image-results/image-results.template.html'
    });

})();
