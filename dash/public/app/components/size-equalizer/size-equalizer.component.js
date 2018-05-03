(function() {
  'use strict';

  angular.module('tapinApp.components')
    .directive('sizeEqualizer', sizeEqualizer);

  function sizeEqualizer() {
    return {
      link: function(scope, elem, attrs) {
        var $elem = $(elem);

        var lastWidth = null;

        var interval = setInterval(() => {
          var newWidth = $elem.outerWidth();

          $elem.css('height', newWidth);

          if(lastWidth === newWidth) {
            clearInterval(interval);

            $elem.addClass('size-equalizer-done');
          }

          lastWidth = newWidth;
        }, 120);

        scope.$on('$destroy', () => { clearInterval(interval) });
      }
    }
  }
})();
