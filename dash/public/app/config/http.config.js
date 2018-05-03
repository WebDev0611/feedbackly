(function() {

  function interceptor($q, $window, $localStorage, Toaster) {
    return {
      request: function(config){
        // use this to prevent destroying other existing headers

        if(config.url.indexOf("bcid") > -1) return config;
        var user = $localStorage.user
        var jwt = user.jwt;
        config.headers['Authorization'] = 'JWT ' + jwt;

        return config;
      },
      responseError: function(response) {

        if(response.status === 400 && response.config.url.indexOf('bcid') > -1){
          return $q.reject(response);
        }

        if(response.status === 401) {
          Toaster.danger('Unauthorized. Try re-logging in.');
        } else {
          Toaster.danger('An error occured');
          return $q.reject(response);
        }


      }
    }
  }

  interceptor.$inject = ['$q', '$window', '$localStorage','Toaster'];

  function config($httpProvider) {
    $httpProvider.interceptors.push(interceptor);
  }

  config.$inject = ['$httpProvider'];

  angular.module('tapinApp')
    .config(config);

})();
