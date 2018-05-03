(function() {

  var template = _.template(`
    <% if(items === undefined || items.length === 0) { %>
      <p class="center-align grey-text">
        <%= translate('Nothing here yet') %>
      </p>
    <% } else { %>
      <% if(noWrapper !== 'true') { %>
        <div class="collection">
      <% } %>
        <% items.forEach(function(item) { %>
          <a class="collection-item <%= activeId === item._id ? 'active' : '' %>" href="<%= href(state, params(item)) %>">
            <% if(displayAttribute !== undefined) { %>
              <%- item[displayAttribute] %>
            <% } else if(displayTemplate !== undefined) { %>
              <%= _.template(displayTemplate)({ item: item }) %>
            <% } %>
          </a>
        <% }) %>
      <% if(noWrapper !== 'true') { %>
        </div>
      <% } %>
    <% } %>
  `);

  function render($elem, $state, $filter, scope) {
    var href = (state, params) => $state.href(state, params);
    var params = item => {
      var paramObj = {};

      paramObj[scope.idParam || 'id'] = item._id;

      return paramObj;
    }

    var activeId = $state.params[scope.idParam || 'id'];

    $elem.html(template({ _, params, activeId, items: scope.items, href, displayAttribute: scope.displayAttribute, displayTemplate: scope.displayTemplate, state: scope.targetState, noWrapper: scope.noWrapper, translate: $filter('translate') }));

    var $links = $elem.find('.collection-item');

    $links
      .on('click', function() {
        $('html, body').animate({ scrollTop: '0px' });

        $links.removeClass('active');
        $(this).addClass('active');
      });
  }

  function collection($state, $filter, $rootScope) {
    return {
      scope: {
        items: '=',
        displayAttribute: '@',
        displayTemplate: '@',
        targetState: '@',
        idParam: '@',
        noWrapper: '@'
      },
      restrict: 'E',
      link: (scope, elem, attrs) => {
        var $elem = $(elem);

        $rootScope.$on('$stateChangeSuccess', () => render($elem, $state, $filter, scope))

        scope.$watch(() => scope.items, (newItems) => render($elem, $state, $filter, scope));
      }
    }
  }

  collection.$inject = ['$state', '$filter', '$rootScope'];

  angular.module('tapinApp.components')
    .directive('collection', collection);

})();
