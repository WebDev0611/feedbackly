(function() {

  function link(Restangular) {
    return (scope, elem, attrs) => {
      var alignHorizontal = scope.alignHorizontal || 'left';
      var alignVertical = scope.alignVertical || 'top';

      var $elem = $(elem);
      var $wrapper = $elem.find('.hint-wrapper');

      if(scope.top !== undefined) {
        $wrapper.css('top', `${scope.top}px`);
      }

      if(scope.bottom !== undefined) {
        $wrapper.css('bottom', `${scope.bottom}px`);
      }

      if(window.COMPLETED_HINTS.indexOf(scope.hintId) < 0) {
        $wrapper.show();
      } else {
        return;
      }

      $wrapper.addClass(`hint-wrapper--${alignHorizontal} hint-wrapper--${alignVertical}`);

      var $text = $wrapper.find('.hint-wrapper__text');
      var $trigger = $wrapper.find('.hint-wrapper__trigger');
      var $pulse = $trigger.find('.hint-wrapper__trigger__pulse');
      var $gotIt = $text.find('.hint-wrapper__text__got-it');
      var $parent = $elem.parent();

      $parent.addClass('hint-parent');

      $('html')
        .on('click', function() {
          $text.removeClass('hint-wrapper__text--show');
        });

      $text
        .on('click', function(e) {
          e.stopPropagation();
        });

      $trigger
        .on('click', function(e) {
          e.stopPropagation();

          var triggerRightSpace = $(window).width() - $trigger.offset().left;

          if(triggerRightSpace < 300) {
            $text.css({
              right: `-${$pulse.css('width')}`,
              left: 'initial'
            });
          } else {
            $text.css({
              left: '0px',
              right: 'initial'
            });
          }

          $text.addClass('hint-wrapper__text--show');
        });

      $gotIt
        .on('click', function(e) {
          e.stopPropagation();
          e.preventDefault();

          $wrapper.hide();

          Restangular
            .one('completed_hints', scope.hintId)
            .all('complete')
            .post()
            .then(() => {
              window.COMPLETED_HINTS.push(scope.hintId);
            });
        });
    }
  }

  function hint(Restangular) {
    return {
      scope: {
        text: '@',
        hintId: '@',
        alignVertical: '@',
        alignHorizontal: '@',
        top: '@',
        bottom: '@'
      },
      transclude: true,
      restrict: 'E',
      template: `
        <div class="hint-wrapper">
          <div class="hint-wrapper__text z-depth-1">
            <ng-transclude></ng-transclude>

            <div class="hint-wrapper__text__got-it">
              <a href="#" class="no-select" translate>
               Got it!
              </a>
            </div>
          </div>

          <div class="hint-wrapper__trigger">
            <div class="hint-wrapper__trigger__dot"></div>
            <div class="hint-wrapper__trigger__pulse">
              <i class="material-icons">lightbulb_outline</i>
            </div>
          </div>
        </div>
      `,
      link: link(Restangular)
    }
  }

  hint.$inject = ['Restangular'];

  angular.module('tapinApp.components')
    .directive('hint', hint);

})();
