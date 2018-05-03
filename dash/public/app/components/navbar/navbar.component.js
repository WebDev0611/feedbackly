(function() {
  class Navbar {
    updateOrganizationRights(featureConstants) {
      this._UserStore.getUserRights()
      .then(rights => {
        this.organizationRights = {
          inbox: rights.availableFeatures.indexOf(featureConstants.FEEDBACK_INBOX) > -1,
          upsell: rights.availableFeatures.indexOf(featureConstants.UPSELL_MODULE) > -1,
          survey_create: rights.survey_create,
          segment: rights.segment
        }
      })
    }

    /*@ngInject*/
    constructor($scope, $rootScope, $state, UserStore, Restangular, Toaster, $window, featureConstants) {
      this.state = $state;
      this._UserStore = UserStore;
      this._Restangular = Restangular;
      this._$window = $window;
      this._Toaster = Toaster;
      this.organizationRights = {inbox: false, upsell: false, survey_create: false, segment: ""}
      
      $rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams, options) => {
        if(window.onbeforeunload) {
          // if states have the same saveGroup we can ignore onbeforeunload
          if(fromState.saveGroup && (fromState.saveGroup !== toState.saveGroup)) {
            if(!confirm(window.onbeforeunload())) {
              event.preventDefault();
              return;
            }
          }
          window.onbeforeunload = null;
        }
        this.loadingContent = true;
      });

      $rootScope.$on('$stateChangeSuccess', () => {
        this.loadingContent = false;
      });

      this.user = this._UserStore.getUserSignedIn()

      this._UserStore.onSignedInUserChange($scope, () => {
        this.user = this._UserStore.getUserSignedIn();
        this._updateOrganizations();
      });

      this._Restangular
        .one('user', this.user._id)
        .all('organizations')
        .getList()
        .then(organizations => {
          this._allOrganizations = organizations;
          this._updateOrganizations();
        });
      
      this.updateOrganizationRights(featureConstants)

    }

    switchToOrganization(organizationId) {
      this._Toaster.neutral('Switching organization...');

      this._Restangular
        .one('users', this.user._id)
        .all('switch_organization')
        .post({ organizationId })
        .then(res => {
          this._UserStore.updateUserSignedIn(res);
          this._updateOrganizations();

          this.state.go('summary', {}, { reload: true });
        })
        .catch(err => {
          var errorMessage = _.get(err, 'data.error');

          if(errorMessage !== undefined) {
            this._Toaster.danger(errorMessage, { translate: false });
          }
        });
    }

    toggleExpanded() {
      this.isExpanded = !this.isExpanded;
    }

    signOut() {
      this._UserStore.setUserSignedIn({});
      this._$window.location.replace('/');
    }

    _updateOrganizations() {
      this.organizations = _.filter(this._allOrganizations, organization => organization._id.toString() !== this.user.organization_id.toString());
    }
  }

  angular.module('tapinApp.components')
    .directive('navbar', () => {
      return {
        scope: {},
        restrict: 'E',
        controller: Navbar,
        link: (scope, elem, attrs) => {
          var $navbar = $(elem).find('#navbar');
          var $burger = $(elem).find('#navbar-burger');
          var $mainContainer = $('#main-container');

          $burger.on('click', function() {
            $burger.toggleClass('expanded');
            $navbar.toggleClass('mobile-expanded');

            if($burger.hasClass('expanded')) {
              $burger.find('i').html('close');
              $mainContainer.addClass('push-right-mobile');
            } else {
              $burger.find('i').html('menu');
              $mainContainer.removeClass('push-right-mobile');
            }
          });
        },
        controllerAs: 'navbar',
        templateUrl: '/app/components/navbar/navbar.template.html'
      }
    });

})();
