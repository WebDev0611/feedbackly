(function() {

  class Barcode {
    /*@ngInject*/
    constructor($http, $q) {
    this.URL_BASE = 'https://barcode.feedbackly.com'
    //this.URL_BASE = 'http://localhost:3000'
    this._$http = $http;
    this._$q = $q;

    }

    validate(opts){
      if(opts.type && opts.code){
        return this._$http.get(`${this.URL_BASE}/?bcid=${opts.type}&text=${opts.code}`)
          .then(res => {
            return {pass: true};
          }, err => {
            var errorText = err.data;
            return {pass: false, error: _.get(err.data.split(':'), '[2]')}
          })
      } else {
        var deferred = this._$q.defer();
        deferred.resolve(true)
        return deferred.promise;
      }



    }


  }

  angular.module('tapinApp.services')
    .service('Barcode', Barcode);

})();
