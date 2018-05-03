(function() {

  class ClientTranslations {
    /*@ngInject*/
    constructor($window) {
      this._$window = $window;
    }

    getButtonTranslations(language, buttonCount) {
      var translations = this._$window.CLIENT_TRANSLATIONS.buttons;

      var titles = {
        '000': translations['terrible'][language],
        '033': translations['bad'][language],
        '025': translations['bad'][language],
        '050': translations['ok'][language],
        '066': translations['good'][language],
        '075': translations['good'][language],
        '100': translations['amazing'][language]
      }

    return titles;
    }

    getEndTranslation(language) {
      return _.get(this._$window.CLIENT_TRANSLATIONS, `end.${language}`) || '';
    }
  }

  angular.module('tapinApp.services')
    .service('ClientTranslations', ClientTranslations);

})();
