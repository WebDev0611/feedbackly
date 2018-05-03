(function() {

  var template = _.template(`
    <% _.each(model.subgroups, function(group) { %>
      <li data-id="devicegroup-<%= group._id %>" class="channel devicegroup">
        <% if(!settings.disableSelection) { %>
          <div class="checkable cursor-pointer">
            <div class="checkable-checkbox">
              <i class="material-icons done">done</i>
              <i class="material-icons remove">remove</i>
            </div>
            <span class="channel-label <%= settings.clickableDevicegroups ? 'cursor-pointer clickable-devicegroup blue-text' : '' %>">
              <%= group.name %>
            </span>
          </div>
        <% } else { %>
          <span class="truncate channel-label <%= settings.clickableDevicegroups ? 'cursor-pointer clickable-devicegroup blue-text' : '' %>">
            <%= group.name %>
          </span>
        <% } %>

        <div class="toggle-group group-visible cursor-pointer grey-text">
          <i class="material-icons visibility">chevron_right</i>
          <i class="material-icons visibility_off">expand_more</i>
        </div>

        <ul>
          <% if(group.subgroups.length > 0) { %>
            <%= template({ model: group, template: template, settings: settings }) %>
          <% } %>

          <% _.each(group.devices, function(device) { %>
            <li data-id="device-<%= device._id %>" class="channel device" data-active-survey="<%= device.active_survey %>" data-name="<%= device.name %>" data-udid="<%= device.udid %>" data-channel-type="<%= device.type %>">
              <% if(!settings.disableSelection) { %>
                <div class="checkable cursor-pointer">
                  <div class="checkable-checkbox">
                    <i class="material-icons">done</i>
                  </div>
                   <%= getIcon(device.type) %> <%= device.name %>
                </div>
              <% } else { %>
                <span class="truncate channel-label">
                  <%= getIcon(device.type) %> <%= device.name %>
                </span>
              <% } %>
            </li>
          <% }); %>
        </ul>
      </li>
    <% }); %>
  `);

  function getActivations($channelTree) {
    var active = [];
    var notActive = [];

    _.forEach($channelTree.find('.channel'), channel => {
      var $channel = $(channel);

      var id = channel.getAttribute('data-id');
      var splitted = id.split('-');
      var name = channel.getAttribute('data-name');
      var udid = channel.getAttribute('data-udid');
      var type = channel.getAttribute('data-channel-type');

      if(splitted[0] === 'device') {
        if($channel.hasClass('chosen')) {
          active.push({ _id: splitted[1], name, type, udid });
        } else {
          notActive.push({ _id: splitted[1], name, type, udid });
        }
      }
    });

    return {
      active: _.uniqBy(active, device => device._id.toString()),
      notActive: _.uniqBy(notActive, device => device._id.toString()),
    }
  }

  function chooseRecursiveParent($channel, checked, $channelTree) {
    var $parent = $channel.parent('ul').parent('li');
    var id = $parent.data('id');
    var $parentsWithId = $channelTree.find(`.channel[data-id="${id}"]`);

    var $siblings = $channel.siblings('li');
    var $chosenSiblings = $channel.siblings('li.chosen');

    if(!checked) {
      $channel.removeClass('chosen');
    } else {
      $channel.addClass('chosen');
    }

    if($parent.length === 0 ) return;

    if($chosenSiblings.length > 0 || $channel.hasClass('chosen')) {
      $parent.addClass('has-chosen-children');
    } else {
      $parent.removeClass('has-chosen-children');
    }

    if($siblings.length === $chosenSiblings.length && $channel.hasClass('chosen')) {
      $parentsWithId.each(function() {
        chooseRecursiveParent($(this), true, $channelTree);
      });
    } else {
      $parentsWithId.each(function() {
        chooseRecursiveParent($(this), false, $channelTree);
      });
    }
  }

  function setStatusOfChannels(id, status, $channelTree) {
    $channelTree.find(`.channel[data-id="${id}"]`).each(function() {
      var $parent = $(this);

      chooseRecursiveParent($parent, status, $channelTree);

      var $children = $parent.find('ul li');

      $children.each(function() {
        var $child = $(this);

        setStatusOfChannels($child.attr('data-id'), status, $channelTree);
      });
    });
  }

  function onChooseChannel($channel, $channelTree) {
    var $parent = $channel.parent('li');

    var status = !$parent.hasClass('chosen');

    setStatusOfChannels($parent.data('id'), status, $channelTree);
  }

  angular.module('tapinApp.components')
    .directive('channelTree', ['$timeout', '$filter', 'DeviceIcons', function($timeout, $filter, DeviceIcons) {
      return {
        scope: {
          survey: '=',
          channels: '=',
          activeChannels: '=',
          onChange: '&',
          onActivationsChange: '&',
          onDevicegroupClick: '&',
          disableSelection: '@',
          clickableDevicegroups: '@',
          changeButton: '=',
          buttonChanged: '=',
          searchCriteria: '='
        },
        link: function(scope, elem, attrs) {
          var $elem = $(elem);
          var $channelTree = $elem.first('.channel-tree');
          var receivedChannels = false;
          var getIcon = DeviceIcons.getIcon;

          scope.$watch(() => scope.channels, (newVal, oldVal) => {
            if(newVal) {
              render(newVal);
              update(scope.activeChannels);
            }
          });

          scope.$watch(() => scope.survey, (newVal, oldVal) => {
            if(newVal) {
              update(newVal);
            }
          });

          scope.$watch(() => scope.activeChannels, (newVal, oldVal) => {
            if(newVal) {
              update(newVal);
            }
          });

          function onChange() {
            var activations = getActivations($channelTree);
            if(scope.channels != undefined){
              scope.onChange({ channels: activations.active });
              if(_.isFunction(scope.onActivationsChange)) {
                scope.onActivationsChange({ activations });
              }
            }
          }

          function update(data) {
            if(!data) return;

            if(scope.survey) {
              _.chain($channelTree.find(`.channel[data-active-survey="${data._id}"]`))
                .map(channel => channel.getAttribute('data-id'))
                .forEach(channel => {
                  setStatusOfChannels(channel, true, $channelTree)
                })
                .value();
            } else {
              data.forEach(channel => {
                setStatusOfChannels(`device-${channel._id}`, true, $channelTree);
              });
            }

            $timeout(() => {
              onChange()
            });
          }

          function render(data) {
            var emptyTree = data.length === 0 ?
              '<div class="grey-text">' + $filter('translate')('Nothing here yet') + '</div>'
                :
              '';

            var settings = {};

            settings.disableSelection = scope.disableSelection === 'true'
              ? true
              : false;

            settings.clickableDevicegroups = scope.clickableDevicegroups === 'true'
              ? true
              : false;

              function getIcon(type){
                var icons = {
                  DEVICE: 'tablet',
                  PLUGIN: 'code',
                  LINK: 'link',
                  QR: 'smartphone',
                  EMAIL: 'email',
                  SMS: 'message'
                }
                var icon = icons[type];
                return `<i class="device-type material-icons">${icon}</i>`
              }

            $elem.html(`
              <div class="channel-tree">
                ${emptyTree}
                <ul>${template({ model: { subgroups: data }, template: template, settings: settings, getIcon: getIcon })}<ul>
              </div>
            `);

            $channelTree.find('.toggle-group').on('click', function() {
              var $toggle = $(this);

              $toggle.toggleClass('group-visible');

              var $subgroups = $toggle.parent('li').find('ul')

              if($toggle.hasClass('group-visible')) {
                $subgroups.css('display', 'block');
              } else {
                $subgroups.css('display', 'none');
              }
            });

            if(settings.disableSelection === false) {
              $channelTree.find('.checkable').on('click', function() {
                var chosen = onChooseChannel($(this), $channelTree);
                scope.searchCriteria && scope.changeButton();
                $timeout(() => onChange());
              });

              update(scope.survey);
            } else {
              $channelTree.children('.channel-tree').addClass('selection-disabled');
            }

            if(settings.clickableDevicegroups === true) {
              $channelTree.find('.clickable-devicegroup')
                .on('click', function() {
                  var $group = $(this).closest('.devicegroup');
                  var id = $group.attr('data-id').split('-')[1];

                  if(_.isFunction(scope.onDevicegroupClick)) {
                    $('body, html').animate({ scrollTop: '0px' });

                    scope.onDevicegroupClick({ id });
                  }
                });
            }
          }
        }
      }
    }]);

})();
