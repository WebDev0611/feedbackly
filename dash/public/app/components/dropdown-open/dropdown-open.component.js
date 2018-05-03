(function() {

  function dropdownOpen($timeout) {
    return {
      restrict: 'A',
      link: (scope, elem, attrs) => {
        var $elem = $(elem);

        if(attrs.dropdownOpen === 'true') {
          $timeout(() => {
            $elem.dropdown();
            $elem.trigger('click');
          });
        }
      }
    }
  }

  dropdownOpen.$inject = ['$timeout'];

  angular.module('tapinApp.components')
    .directive('dropdownOpen', dropdownOpen);

})();
