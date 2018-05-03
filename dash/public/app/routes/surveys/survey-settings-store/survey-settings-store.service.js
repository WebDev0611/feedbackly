(function() {

  class SurveySettingsStore {
    /*@ngInject*/
    constructor(PubSub, Restangular) {
      this._PubSub = PubSub;
      this._settings = {};
      this._Restangular = Restangular;
      this._ON_SURVEY_SETTINGS_CHANGE = 'ON_SURVEY_SETTINGS_CHANGE';
    }

    onChange(scope, subscription) {
      var token = this._PubSub.subscribe(this._ON_SURVEY_SETTINGS_CHANGE, subscription);

      scope.$on('$destroy', () => this._PubSub.unsubscribe(token));
    }

    updateSettings(surveyId, update) {
      this._settings[surveyId] = _.assign({}, this._settings[surveyId], update);
      this._PubSub.publish(this._ON_SURVEY_SETTINGS_CHANGE);
    }

    getSettings(surveyId) {
      return this._settings[surveyId] || {};
    }    
  }

  angular.module('tapinApp.services')
    .service('SurveySettingsStore', SurveySettingsStore);

})();
