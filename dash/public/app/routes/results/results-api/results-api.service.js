(function() {

  class ResultsApi {
    constructor($http) {
      this._$http = $http;
    }

    getQuestions(options) {
      return this._$http.post('/api/questions/search', options).then(response => response.data);
    }

    getQuestionResults(options) {
      options = _.assign({}, options);

      options.devices = _.map(options.devices, device => device._id);
      options.surveys = _.map(options.surveys, survey => survey._id);

      return this._$http.post(`/api/questions/${options.question._id}/results`, options).then(response => response.data);
    }
  }

  ResultsApi.$inject = ['$http'];

  angular.module('tapinApp.services')
    .service('ResultsApi', ResultsApi);

})();
