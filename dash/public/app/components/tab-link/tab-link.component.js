(function() {

  function tabLink($state, $rootScope, $timeout) {
    return {
      scope: {
        target: '@',
        params: '&',
        activeState: '@'
      },
      link: (scope, elem, attrs) => {
        $timeout(() => {
          var $elem = $(elem);
          var $parent = $elem.closest('ul.tabs');

          var targetParams = scope.params === undefined
            ? {}
            : scope.params();

          var targetState = scope.target;
          var id = `${_.now().toString(36)}-${_.random(0, 1000).toString(36)}`;

          $elem.attr('id', id);

          if($state.includes(scope.activeState)) {
            $elem.addClass('active');
          }

          if(!$parent.hasClass('tabs-initialized')) {
            $parent.tabs();
            $parent.addClass('tabs-initialized');
          }

          $elem.on('click', (e) => {
            e.preventDefault();

            $parent.tabs('select_tab', id)

            $state.go(targetState, targetParams);
          });

          if($state.includes(scope.activeState)) {
            $parent.tabs('select_tab', id)
          }

          $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            if($state.includes(scope.activeState)) {
              $parent.tabs('select_tab', id)
            }
          });
        });
      }
    }
  }

  tabLink.$inject = ['$state', '$rootScope', '$timeout'];

  angular.module('tapinApp.components')
    .directive('tabLink', tabLink);

})();
