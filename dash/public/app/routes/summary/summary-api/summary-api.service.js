(function() {

  class SummaryApi {
    constructor($http) {
      this._$http = $http;
    }

    getDailyAverage(options) {
      return this._$http.get('/api/summary/average/day', { params: options });
    }

    getHourlyAverage(options) {
      return this._$http.get('/api/summary/average/hour', { params: options });
    }

    getFeedbackAmount(options) {
      return this._$http.get('/api/summary/amount/fb', { params: options });
    }

    getFbeventAmount(options) {
      return this._$http.get('/api/summary/amount/fbe', { params: options });
    }

    getOrganizationAverage(options) {
      return this._$http.get('/api/summary/average/organization', { params: options });
    }

    getNps(options) {
      return this._$http.get('/api/summary/nps', { params: options });
    }

    getAllFeedbackAmount(options) {
      return this._$http.get('/api/summary/amount/allfb', { params: options });
    }

    getBestDevices(options) {
      return this._$http.get('/api/summary/best_devices', { params: options });
    }
  }

  SummaryApi.$inject = ['$http'];

  angular.module('tapinApp.services')
    .service('SummaryApi', SummaryApi);

})();
