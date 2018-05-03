(function() {

  class UrlParser {
    getParameterValue(name) {
      var url = window.location.href;
      url = url.toLowerCase();
      name = name.replace(/[\[\]]/g, "\\$&").toLowerCase();
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)")
      var results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
  }

  angular.module('signUpApp.services')
    .service('UrlParser', UrlParser);

})();
