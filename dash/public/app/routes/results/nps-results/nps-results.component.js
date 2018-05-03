(function() {

  class NpsResults extends ResultsComponent {
    /*@ngInject*/
    constructor($scope, ResultsApi, ResultsStore, colorConstants, ChartFactory, $filter) {
      super($scope, ResultsStore);

      this._ResultsApi = ResultsApi;
      this._ResultsStore = ResultsStore;
      this._ChartFactory = ChartFactory;
      this._$filter = $filter;
      this._colorConstants = colorConstants;

      this._initializeCharts();
    }

    npsValueToClass(value) {
      switch(value) {
        case 'Promoters':
          return 'green-text';
          break;
        case 'Passives':
          return 'yellow-text';
          break;
        case 'Detractors':
          return 'red-text';
          break;
      }
    }

    _groupTotals(totals) {
      var totalsMap = { 'Detractors': 0, 'Passives': 0, 'Promoters': 0 };

      totals.forEach(total => {
        var value = parseFloat(total.name);
        if(value <= 0.6) {
          totalsMap['Detractors'] += total.value;
        } else if(value == 0.7 || value == 0.8) {
          totalsMap['Passives'] += total.value;
        } else if(value == 0.9 || value == 1) {
          totalsMap['Promoters'] += total.value;
        }
      });

      var grouped = [];

      for(var value in totalsMap) {
        grouped.push({ name: value, id: value, value: totalsMap[value] });
      }

      return grouped;
    }

    _initializeCharts() {
      this._ResultsApi.getQuestionResults(_.assign(this._filter, { question: this.question }))
        .then(results => {
          var sorter = (a, b) => parseFloat(b.name) - parseFloat(a.name);

          this.colorMap = _.reduce(_.range(0, 11), (map, value) => {
            map[(value / 10).toString()] = this._colorConstants.NPS_COLORS[value];

            return map;
          }, {});

          var channelNameList = results.channelList;
          this.question.charts = this._ChartFactory.createNpsCharts(results.charts, channelNameList, { colorMapper: this.colorMap });

          results.totals.regular.sort(sorter);
          results.totals.normalized.sort(sorter);

          this.question.totals = results.totals;

          this.question.totals.grouped = this._groupTotals(this.question.totals.regular);

          this._initializeSettings();
        });
    }
  }

  angular.module('tapinApp.components')
    .component('npsResults', {
      bindings: {
        question: '<',
        compare: '@'
      },
      controller: NpsResults,
      controllerAs: 'npsResults',
      templateUrl: '/app/routes/results/nps-results/nps-results.template.html'
    })

})();
