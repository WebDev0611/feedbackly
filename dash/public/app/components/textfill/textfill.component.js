(function() {

  function textfill(scope, elem, attrs) {
    var $elem = $(elem);
    var $content = $elem.find('span');

    function update() {
      var maxFontSize = scope.maxFontSize === undefined
         ? 20
         : parseInt(scope.maxFontSize);

      $elem.removeAttr('style');
      $content.removeAttr('style');

      $elem.textfill({
        changeLineHeight: true,
        maxFontPixels: maxFontSize
      });
    }

    scope.$watch(() => scope.text, () => update());

    update();
  }

  angular.module('tapinApp.components')
    .directive('textfill', function() {
      return {
        scope: {
          text: '=',
          maxFontSize: '@'
        },
        link: textfill,
        template: '<span></span>'
      }
    });

})();
