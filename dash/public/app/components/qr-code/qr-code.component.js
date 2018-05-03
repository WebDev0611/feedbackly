(function() {

  function render($elem, code, options) {
    code.clear();
    code.makeCode(options.scope.text);
  }

  function qrCode($filter) {
    return {
      scope: {
        text: '=',
        width: '@',
        height: '@',
        downloadLink: '@',
        downloadFileName: '@',
        onDataUrlChange: '&'
      },
      restrict: 'E',
      link: (scope, elem, attrs) => {
        var code = new QRCode(elem.context, {
          text: scope.text,
          width: parseInt(scope.width || 250),
          height: parseInt(scope.height || 250),
          colorDark : "#000000",
          colorLight : "#ffffff",
          correctLevel : QRCode.CorrectLevel.H
        });

        var $elem = $(elem);
        var $qrDownload;


        scope.$watch(() => scope.text, () => {
          render($elem, code, { scope, $downloadElem: $qrDownload });
        });
      }
    }
  }

  qrCode.$inject = ['$filter'];

  angular.module('tapinApp.components')
    .directive('qrCode', qrCode);

})();
