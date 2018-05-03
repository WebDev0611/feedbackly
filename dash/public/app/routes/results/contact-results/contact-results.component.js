(function() {

  class ContactResults extends ResultsComponent {
    constructor($scope, ResultsApi, ResultsStore) {
      super($scope, ResultsStore);

      this._ResultsApi = ResultsApi;
      this._ResultsStore = ResultsStore;

      this._initializeCharts();

      this.contactsLimit = 20;
    }

    showMore() {
      this.contactsLimit += 20;
    }

    _initializeCharts() {
      this._ResultsApi.getQuestionResults(_.assign(this._filter, { question: this.question }))
        .then(results => {
          this.question = _.assign({}, this.question, { charts: results.charts, totals: results.totals });
          this.activeChart = this.question.charts;

          this._updatePayload();
        });
    }
  }

  ContactResults.$inject = ['$scope', 'ResultsApi', 'ResultsStore'];

  angular.module('tapinApp.components')
    .component('contactResults', {
      bindings: {
        question: '<',
        compare: '@'
      },
      controller: ContactResults,
      controllerAs: 'contactResults',
      templateUrl: '/app/routes/results/contact-results/contact-results.template.html'
    })

})();
