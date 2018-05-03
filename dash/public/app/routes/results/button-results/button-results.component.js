(function() {

  class ButtonResults extends ResultsComponent {
    /*@ngInject*/
    constructor($scope, ResultsApi, ResultsStore, ChartFactory, Buttons) {
      super($scope, ResultsStore);

      this._ResultsApi = ResultsApi;
      this._ResultsStore = ResultsStore;
      this._ChartFactory = ChartFactory;
      this._Buttons = Buttons;

      this._initializeCharts();
    }

    _initializeCharts() {
      this._ResultsApi.getQuestionResults(_.assign(this._filter, { question: this.question }))
        .then(results => {
          this.colorMap = _.reduce(results.totals.regular, (map, total) => {
            map[total.name.toString()] = this._Buttons.buttonValueToColor(total.name);
            return map;
          }, {});

          var channelNameList = results.channelList;
          this.question.charts = this._ChartFactory.createButtonCharts(results.charts, channelNameList, { colorMapper: this.colorMap });
          var sorter = (a, b) => parseFloat(b.name) - parseFloat(a.name);

          results.totals.regular.sort(sorter);
          results.totals.normalized.sort(sorter);

          this.question.totals = results.totals;

          this._initializeSettings();
        });
    }
  }

  angular.module('tapinApp.components')
    .component('buttonResults', {
      bindings: {
        question: '<',
        compare: '@'
      },
      controller: ButtonResults,
      controllerAs: 'buttonResults',
      templateUrl: '/app/routes/results/button-results/button-results.template.html'
    });
})();
