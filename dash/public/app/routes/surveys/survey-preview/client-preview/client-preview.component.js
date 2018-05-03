(function() {

  function link(scope, elem, attrs) {
    var $elem = $(elem);
    var $iframe = $elem.find('iframe');
    var $wrapper = $elem.find('.iframe-wrapper');
    var className = '';

    var mapToView = {
      'DEVICE': 'ipad',
      'WEB': 'web',
      'MOBILE': 'mobile'
    };

    function getUrl() {
      return `${window.envConfig.PREVIEW_URL}/previews/${scope.survey._id}?view=${mapToView[scope.type]}`;
    }

    switch(scope.type) {
      case 'DEVICE':
        className = 'iframe-wrapper-pad';
        break;
      case 'MOBILE':
        className = 'iframe-wrapper-mobile';
        break;
      case 'WEB':
        className = 'iframe-wrapper-web';
        break;
      default:
        className = 'iframe-wrapper-pad';
    }

    $wrapper.addClass(className);

    scope.$watch(() => scope.survey, () => {
      if(scope.survey !== undefined) {
        $iframe.attr('src', getUrl());
      }
    });
  }

  function clientPreview() {
    return {
      scope: {
        survey: '=',
        type: '@'
      },
      controllerAs: 'clientPreview',
      restrict: 'E',
      link,
      template: `
        <div class="iframe-wrapper z-depth-1">
          <iframe></iframe>
        </div>
      `
    }
  }

  angular.module('tapinApp.components')
    .directive('clientPreview', clientPreview);

})();
