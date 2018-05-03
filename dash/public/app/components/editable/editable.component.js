(function() {

  function link(scope, elem, attrs) {
    var $elem = $(elem);
    var $content = $elem.find('span');
    var timeout;
    var maxFontSize = scope.maxFontSize === undefined
       ? 20
       : parseInt(scope.maxFontSize);

    var fromInput = false;

    function updateTextFill() {
      $elem.removeAttr('style');
      $content.removeAttr('style');

      $elem.textfill({
        changeLineHeight: true,
        maxFontPixels: maxFontSize
      });
    }

    function setPlaceholder() {
      if(_.isEmpty(scope.text) && scope.placeholder !== undefined) {
        $content.html(scope.placeholder);
        $elem.addClass('has-placeholder');
      } else {
        $elem.removeClass('has-placeholder');
      }
    }

    function update() {
      fromInput = true;

      var sanitized = $content.html().replace(/((<br>)|(<div>)|(&nbsp;))/g, '');

      scope.$apply(() => scope.text = _.unescape(sanitized));

      $elem.removeClass('has-placeholder');

      fromInput = false;

      updateTextFill();
    }

    if(!(scope.isDisabled === 'true' || scope.isDisabled === true)) {
      $elem.removeClass('disabled');

      $content.attr('contenteditable', 'true');

      $content
        .on('focus', function() {
          if(!scope.text) {
            $content.html('');
          }
        });

      $content
        .on('blur', function() {
          setPlaceholder();
        });

      $content
        .on('input propertychange', function() {
          update();
        });

      $content
        .on('paste', function(e) {
          e.preventDefault();
        });

    } else {
      $elem.addClass('disabled');
    }

    if(scope.updateId !== undefined) {
      scope.$watch(() => scope.updateId, () => {
        if(timeout !== undefined) {
          clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
          updateTextFill();
        }, 200);
      });
    }

    scope.$watch(() => scope.text, () => {
      if(fromInput === false) {
        if(!scope.text) {
          $content.html(scope.placeholder || '');
          $elem.addClass('has-placeholder');
        } else {
          $content.html(scope.text);
          $elem.removeClass('has-placeholder');
        }

        if(timeout !== undefined) {
          clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
          updateTextFill();
        }, 200);
      }
    });

    setPlaceholder();
  }

  function editable() {
    return {
      scope: {
        text: '=',
        isDisabled: '@',
        maxFontSize: '@',
        placeholder: '@',
        updateId: '='
      },
      restrict: 'A',
      link,
      template: '<span></span>'
    }
  }

  angular.module('tapinApp.components')
    .directive('editable', editable);

})();
