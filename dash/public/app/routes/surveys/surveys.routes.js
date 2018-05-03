(function() {

  function settingsRequired($stateParams, $state, SurveySettingsStore, $q, $timeout) {
    var settings = SurveySettingsStore.getSettings($stateParams.surveyId);

    var deferred = $q.defer();

      $timeout(() => {
        if (settings.channels === undefined || settings.translation === undefined) {
          // $state.go('surveys.editor', { surveyId: $stateParams.surveyId });
          // deferred.reject();
          deferred.resolve();

        } else {
          deferred.resolve();
        }
      });

    return deferred.promise;
  }

  settingsRequired.$inject = ['$stateParams', '$state', 'SurveySettingsStore', '$q', '$timeout'];

  function surveyResolve($stateParams, Restangular, SurveySettingsStore) {
      var surveyId = $stateParams.surveyId;
      var sSettings = false;//SurveySettingsStore.getSettings(surveyId)
      if(sSettings.survey) {
        return sSettings.survey;
      } else{
        return Restangular.one('v2/surveys', surveyId).get()
        .then(s => {
          SurveySettingsStore.updateSettings(surveyId, {survey: s})
          return s;
        });
      }
  }

  surveyResolve.$inject = ['$stateParams', 'Restangular', 'SurveySettingsStore'];


  function channelRightsResolve(UserStore) {
    return UserStore.getUserRights()
    .then(rights => {
      return rights.deviceObjects
    })
  }

  channelRightsResolve.$inject = ['UserStore'];

  function activeChannelsResolve(options) {
    var resolve = ($stateParams, UserStore) => {
      return UserStore.getUserRights()
      .then(rights => {
        var filtered = _.filter(rights.deviceObjects, {active_survey: $stateParams.surveyId})
        var ipadSetupDevice = _.find(rights.deviceObjects, {ipad_setup_device: true});
        if(filtered.length == 0 && ipadSetupDevice) return [ipadSetupDevice];
        else return filtered;
      })
    }

    resolve.$inject = ['$stateParams','UserStore'];

    return resolve;
  }

  function channelResolve() {
    var resolve = ($stateParams, UserStore) => {
      return UserStore.getUserRights()
      .then(rights => {
        return rights.deviceObjects
      })
    }

    return resolve;
  }

  function userRightsResolve(UserStore) {
    return UserStore.getUserRights();
  }
  userRightsResolve.$inject = ['UserStore'];

  function surveySchedulationsResolve($stateParams, Restangular) {
    return Restangular
      .one('surveys', $stateParams.surveyId)
      .all('schedulations')
      .getList();
  }

  surveySchedulationsResolve.$inject = ['$stateParams', 'Restangular'];

  function surveyListResolve(Restangular) {
    return Restangular.one('surveys').get({ show_archived: false, skip: 0, limit: 25, include_meta: true });
  }

  surveyListResolve.$inject = ['Restangular'];

  function deviceGroupResolve(UserStore) {
    return UserStore.getUserRights()
    .then(rights => {
      return rights.devicegroupObjects
    })
  }

  deviceGroupResolve.$inject = ['UserStore'];

  function channelTreeResolve(type) {
    var resolve = (UserStore) => {
      return UserStore.getUserRights()
      .then(rights => {
        var tree = rights.deviceTree;
        if(type){
          tree = _.filter(rights.deviceTree, {type: type})
        }
        return tree;
      })
    }

    resolve.$inject = ['UserStore'];

    return resolve;
  }

  function organizationResolve(options) {
    var getOrganization = (Restangular, UserStore) => {
      var user = UserStore.getUserSignedIn();

      return Restangular
        .one('organizations', user.organization_id)
        .get(options);
    };

    getOrganization.$inject = ['Restangular', 'UserStore'];

    return getOrganization;
  }


  function routes($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('surveysList', {
        url: '/survey-list',
        templateUrl: '/app/routes/surveys/surveys-list/surveys-list.template.html',
        controller: 'SurveysListController',
        controllerAs: 'surveysList',
        resolve: {
          surveyList: surveyListResolve
        }
      })
      .state('surveys', {
        url: '/surveys',
        templateUrl: '/app/routes/surveys/surveys.template.html',
        controller: 'SurveysController',
        controllerAs: 'surveys',
        saveGroup: 'SURVEYS',
        abstract: true
      })
      .state('surveys.editor', {
        url: '/:surveyId/edit',
        templateUrl: '/app/routes/surveys/survey-editor/react-survey-editor.template.html',
        controller: 'ReactSurveyEditorController',
        controllerAs: 'surveyEditor',
        saveGroup: 'SURVEYS',
        resolve: {
          activeSurvey: surveyResolve,
          activeChannels: activeChannelsResolve({}),
          userRights: userRightsResolve,
        }
      })
      .state('surveys.preview', {
        url: '/:surveyId/preview',
        templateUrl: '/app/routes/surveys/survey-preview/survey-preview.template.html',
        controller: 'SurveyPreviewController',
        controllerAs: 'surveyPreview',
        saveGroup: 'SURVEYS',
        resolve: {
          activeSurvey: surveyResolve,
          activeChannels: activeChannelsResolve({})
        }
      })
      .state('surveys.routes-selection', {
        url: '/:surveyId/routes-selection',
        templateUrl: '/app/routes/surveys/survey-routes-selection/survey-routes-selection.template.html',
        controller: 'SurveyRoutesSelectionController',
        controllerAs: 'surveyRoutesSelection',
        saveGroup: 'SURVEYS',
        resolve: {
          activeSurvey: surveyResolve,
          allChannels: channelResolve(),
          channelRights: channelRightsResolve,
          activeChannels: activeChannelsResolve({}),
          channelTree: channelTreeResolve(),
          deviceGroups: deviceGroupResolve,
          userRights: userRightsResolve
        }
      })
      .state('surveys.email-settings', {
        url: '/:surveyId/email-settings',
        templateUrl: '/app/routes/surveys/survey-email-settings/survey-email-settings.template.html',
        controller: 'SurveyEmailSettingsController',
        controllerAs: 'surveyEmailSettings',
        saveGroup: 'SURVEYS',
        resolve: {
          activeSurvey: surveyResolve,
          activeChannels: activeChannelsResolve({include_meta: true}),
          organization: organizationResolve({})
        }
      })
      .state('surveys.sms-settings', {
        url: '/:surveyId/sms-settings',
        templateUrl: '/app/routes/surveys/survey-sms-settings/survey-sms-settings.template.html',
        controller: 'SurveySmsSettingsController',
        controllerAs: 'surveySmsSettings',
        saveGroup: 'SURVEYS',
        resolve: {
          activeSurvey: surveyResolve,
          activeChannels: activeChannelsResolve({}),
        }
      })
      .state('surveys.publish-settings', {
        url: '/:surveyId/publish-settings',
        templateUrl: '/app/routes/surveys/survey-publish-settings/survey-publish-settings.template.html',
        controller: 'SurveyPublishSettingsController',
        controllerAs: 'surveyPublishSettings',
        saveGroup: 'SURVEYS',
        resolve: {
          activeSurvey: surveyResolve,
          activeChannels: activeChannelsResolve({include_meta: true})
        }
      })
      .state('surveys.confirmation', {
        url: '/:surveyId/confirmation',
        templateUrl: '/app/routes/surveys/survey-confirmation/survey-confirmation.template.html',
        controller: 'SurveyConfirmationController',
        controllerAs: 'surveyConfirmation',
        saveGroup: 'SURVEYS',
        resolve: {
          activeSurvey: surveyResolve,
          activeChannels: activeChannelsResolve({include_meta: true}),
          userRights: userRightsResolve,
          
        }
      })
  }

  routes.$inject = ['$stateProvider', '$urlRouterProvider'];

  angular.module('tapinApp.routes')
    .config(routes);

})();
