(function() {

  function reset(elem, scope, $filter) {
    var duration = scope.duration
      ? parseInt(scope.duration)
      : 1000;

    var direction = scope.value < 0
      ? -1
      : 1;

    var speed = 10;
    var iterations = duration / speed;
    var increase = Math.round(Math.max(scope.value / iterations, 1)) * direction;

    var currentValue = 0;

    var interval;

    if(interval) {
      clearInterval(interval);
    }

    elem.html(currentValue);

    var interval = setInterval(() => {
      var notReady = direction === 1
        ? currentValue < scope.value
        : currentValue > scope.value;

      if(notReady) {
        currentValue += increase;
      }  else {
        currentValue = scope.value;
        clearInterval(interval);
        interval = undefined;
      }

      var toStr = scope.humanize === 'true'
        ? $filter('humanize')(currentValue)
        : currentValue;

      elem.html(toStr);
    }, speed);
  }

  function counter($filter) {
    return {
      scope: {
        value: '=',
        humanize: '@',
        duration: '@'
      },
      link: (scope, elem, attrs) => {
        scope.$watch(() => scope.value, () => reset(elem, scope, $filter));
      }
    }
  }

  counter.$inject = ['$filter'];

  angular.module('tapinApp.components')
    .directive('counter', counter);

})();
