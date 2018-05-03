(function() {

  class TextResults extends ResultsComponent {
    constructor($scope, ResultsApi, ResultsStore, $http) {
      super($scope, ResultsStore);

      this._$http = $http;
      this._ResultsApi = ResultsApi;
      this._ResultsStore = ResultsStore;

      this.textsLimit = 20;

      this._initializeCharts();
    }

    showMore() {
      this.textsLimit += 20;
    }

    toggleHidden(feedback) {
      feedback.hidden = !feedback.hidden;

      this._updateFeedbackHiddenStatus(feedback);
    }

    _updateFeedbackHiddenStatus(feedback) {
      this._$http.post(`/api/feedbacks/${feedback.feedback_id}/toggle_hidden`, { hidden: feedback.hidden, question_id: feedback._id });
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

  TextResults.$inject = ['$scope', 'ResultsApi', 'ResultsStore', '$http'];

  angular.module('tapinApp.components')
    .component('textResults', {
      bindings: {
        question: '<',
        compare: '@'
      },
      controller: TextResults,
      controllerAs: 'textResults',
      templateUrl: '/app/routes/results/text-results/text-results.template.html'
    });

})();
