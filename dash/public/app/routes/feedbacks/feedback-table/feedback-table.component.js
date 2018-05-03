(function () {
  var template = _.template(`
      <div class="dragscroll" style="overflow: scroll; cursor: all-scroll; cursor : move;">
        <table class="striped centered free" id="feedback-table">
        <thead>
          <tr>
            <th class="normal-column"><%= translate('Date') %></th>
            <th class="normal-column"><%= translate('Time') %></th>
            <th class="normal-column"><%= translate('Channel') %></th>
            <% list.headers.forEach(function(heading) { %>
              <% if(['_id', 'Date', 'Time', 'Channel', 'Browser'].indexOf(heading.key) == -1){ %>
                <th class="<%= getColumnClass(heading) %>">
                    <%= heading.name %>
                </th>
              <% } %>
            <% }) %>
            <th class="normal-column"><%= translate('Browser') %></th>
            <% if(admin === true){ %> <th>&nbsp;</th> <% } %>
          </tr>

        </thead>

        <tbody>
          <% list.rows.forEach(function(row) { %>
            <tr id="<%= row._id %>">
              <% list.headers.forEach(function(heading) { %>
                  <%= getColumnData(row, heading) %>
              <% }) %>
              <% if(admin === true){ %>
                <td>
                  <a class="btn btn-floating red delete-feedback" data-id="<%= row._id %>">
                    <i class="material-icons">delete</i>
                  </a>
                </td>
              <% } %>
            </tr>
          <% }) %>
        </tbody>

      </table>
    </div>
  `);

  var feedbackTable = function (Buttons, $filter, $http, Toaster) {
    return {
      scope: {
        feedbacks: '=',
        admin: '='
      },
      link: function (scope, elem, attrs) {
        var deleting = false;
        $(document).on('click', '.delete-feedback', function (e) {
          e.preventDefault();
          if (!deleting) {
            deleting = true;
            if (scope.admin && confirm($filter('translate')('Are you sure? NOTE: Deleting the feedback currently does not affect the feedback amount and averages shown in the summary section.'))) {
              var target = $(this).attr('data-id');
              $http({
                method: 'DELETE',
                url: `/api/v2/feedbacks/${target}`
              }).then(response => {
                Toaster.success('Feedback deleted.');
                $('#' + target).remove();
                deleting = false;
              }, error => {
                Toaster.danger('Error deleting Feedback.');
                deleting = false;
              });
            } else {
              deleting = false;
            }
          }
        });

        function getColumnData (row, heading) {
          var target = row[heading.key];
          if (heading.key == '_id') return '';
          if (target == undefined) return '<td></td>';

          var html = '<td>';

          switch (heading.type) {
            case 'Button':
              html += `<div class="${Buttons.buttonValueToClass(parseFloat(target) / 100)}"></div>`;
              break;
            case 'Contact':
              if (target === 'true') {
                html += `<i class="material-icons green-text">done</i>`;
              } else if (target === 'false') {
              } else {
                html += target;
              }
              break;
            case 'Slider':
              html += target;
              break;
            case 'Image':
              html += `<div class="image-thumb" style="background-image:url(${target.url})"></div>`;
              break;
            case 'Text':
              html += target;
              break;
            case 'Word':
              html += target;
              break;
            case 'Upsell':
              if (target == true) html += `<i class="material-icons green-text">done</i>`;
              break;
            case 'NPS':
              html += `<div class="nps-thumb">${target}</div>`;
              break;
            default:
              html += target;
          }
          html += '</td>';
          return html;
        }

        function getColumnClass (column) {
          var wideTypes = ['Text', 'Contact', 'Word'];

          if (wideTypes.indexOf(column.type) >= 0) {
            return 'wide-column';
          } else {
            return 'normal-column';
          }
        }

        scope.$watch(() => scope.feedbacks, feedbacks => {
          if (feedbacks !== undefined) {
            $(elem).html(template({ list: feedbacks, getColumnData: getColumnData, getColumnClass: getColumnClass, translate: $filter('translate'), admin: scope.admin }));
          }
        });
      }
    };
  };

  feedbackTable.$inject = ['Buttons', '$filter', '$http', 'Toaster'];

  angular.module('tapinApp.components')
    .directive('feedbackTable', feedbackTable);
})();
