(function(){
  'use strict';

  angular.module('signUpApp.components')
    .directive('inputAutofocus', autofocus);

  autofocus.$inject = ['$timeout'];

  function autofocus($timeout) {
    return {
      restrict: 'A',
      link : function($scope, $element) {
        $timeout(function() {
          $element[0].focus();
        }, 200);
      }
    }
  }
})();
