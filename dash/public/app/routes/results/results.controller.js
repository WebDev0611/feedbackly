(function() {

  class ResultsController {
    /*@ngInject*/
    constructor(defaults, ResultsApi, Restangular, Toaster, Files, ResultsStore, UserStore, $filter, $scope, $window) {
      this._ResultsApi = ResultsApi;
      this._Restangular = Restangular;
      this._ResultsStore = ResultsStore;
      this._Toaster = Toaster;
      this._Files = Files;
      this._$filter = $filter;
      this._$scope = $scope;
      this._$window = $window;

      var defaultTo = moment.utc(defaults.dateTo, 'YYYY-MM-DD');
      var defaultFrom = moment.utc(defaults.dateFrom, 'YYYY-MM-DD');

      this.filters = _.assign({}, defaults, { dateFrom: defaultFrom.toDate(), dateTo: defaultTo.toDate() });

      this._ResultsStore.setQuestionFilter({
        surveys: this.filters.surveys,
        devices: this.filters.devices,
        from: defaultFrom.format('YYYY-MM-DD'),
        to: defaultTo.format('YYYY-MM-DD')
      });

      if(defaults.surveys.length === 0 || defaults.devices.length === 0) {
        this.questions = [];
      } else {
        this._getQuestions(_.map(this.filters.surveys, survey => survey._id));
      }

      this.currentUser = UserStore.getUserSignedIn();

      /// GNP:
      if(this.currentUser.organization_id === '57fcb73750c0e200f43ec7c5'){
        this.showLimitFeedback = true;
      } else this.showLimitFeedback = false;

      this._updateFbeventLimitInfo();

      this._ResultsStore.onQuestionFilterChange($scope, () => this._updateFeedbackFilters());
    }

    _getPayload() {
      return _.assign(
        {},
        { questions: this._ResultsStore.getQuestionPayload() },
        { filter: this._ResultsStore.getQuestionFilter() }
      );
    }

    printResults() {
      if(this.printing || this.questions.length === 0) return;

      this._Toaster.neutral('Creating a file...');

      var payload = this._getPayload();

      if(payload.questions.length === this.questions.length) {
        return this._print(payload);
      }

      var sub = this._ResultsStore.onQuestionPayloadReady(this._$scope, () => {
        payload = this._getPayload();

        this._ResultsStore.unSubscripe(sub);

        this._print(payload);
      });

      this.showAll = true;
    }

    onValidateTerms(validation) {
      this.termValidation = validation;
    }

    _print(payload) {
      this.printing = true;

      this._Restangular
        .all('print-results')
        .post({ payload })
        .then(print => {
          this._Files.download(print.url);

          this.printing = false;
        })
        .catch(() => this.printing = false);
    }

    onFiltersChange(filters) {
      var feedbacks = this._ResultsStore.getQuestionFilter().feedbacks || {};

      if(filters.surveys !== undefined) {
        this._ResultsStore.setQuestionFilter(_.assign({ feedbacks }, filters));
      }
    }

    search() {
      this._Toaster.neutral('Getting the results...');

      var searchFilter = this._ResultsStore.getQuestionFilter();

      this._updateFbeventLimitInfo();

      this._getQuestions(_.map(searchFilter.surveys, survey => survey._id));
    }

    _updateFbeventLimitInfo() {
      var searchFilter = this._ResultsStore.getQuestionFilter();

      this._Restangular
        .all('fbevents')
        .all('count-feedbacks-over-plan')
        .post(searchFilter)
        .then(limit => {
          this.showPlanFbeventLimit = limit.planHasLimit && limit.count > 0;
          this.fbeventLimit = limit;
        });
    }

    _updateFeedbackFilters() {
      var feedbackFilters = this._ResultsStore.getQuestionFilter().feedbacks || {};

      if(_.isEmpty(feedbackFilters)) {
        this.feedbackFilters = [];
      } else {
        this.feedbackFilters = _.chain(feedbackFilters)
          .values()
          .map(value => {
            return { title: value[0].title, questionId: value[0].questionId, filters: value, questionType: value[0].questionType };
          })
          .value();
      }
    }

    _getQuestions(surveyIds) {
      if(surveyIds.length === 0) return;

      this.searchFilter = this._ResultsStore.getQuestionFilter();

      this._ResultsApi.getQuestions({ surveys: surveyIds })
        .then(questions => {
           this.questions = _.filter(questions, q => q.question_type !== 'Upsell');

           this._ResultsStore.setQuestions(questions);
         });
    }
  }

  angular.module('tapinApp.routes')
    .controller('ResultsController', ResultsController)

})();
