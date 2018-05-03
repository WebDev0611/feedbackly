(function() {

  angular.module('tapinApp.components')
    .directive('highchartsChart', highcharts);

  function highcharts() {
    return {
      restrict: 'E',
      scope: {
        data: '=',
        highlightedDays: '&'
      },
      template: '<div class="highcharts-chart-container"></div>',
      link: function(scope, elem, attrs) {
        var chart;

        function draw(data) {
          var $container = $(elem).find('.highcharts-chart-container');

          $container.highcharts(data);

          var chart = $container.highcharts();

          var dates = chart.xAxis[0].tickPositions;
          var daysToHighlight = scope.highlightedDays();

          if(daysToHighlight) {
            var highlightDays = setTimeout(function() {
              var $labels = $(elem).find('.highcharts-xaxis-labels text');

              dates.forEach(function(date, index) {
                var localLocale = moment(date);
                localLocale.locale('en');
                var weekday = localLocale.utc().format('dddd');
                var regexp = /[0-9]+\.[0-9]+\./;

                if(daysToHighlight.indexOf(weekday) >= 0 && $labels[index] !== undefined && regexp.test($labels[index].innerHTML)) {
                  $labels[index].style['fill'] = '#fe767c';
                  $labels[index].style['font-weight'] = 'bold';
                }

                clearTimeout(highlightDays);
              });
            }, 500);
          }
        }

        scope.$watch(
          function() {
            return scope.data;
          }, function(newVal, oldVal) {
            if(_.isEmpty(newVal) || _.isEmpty(newVal.series)) {
              return;
            }

            draw(newVal);
          });
      }
    }
  }
})();
