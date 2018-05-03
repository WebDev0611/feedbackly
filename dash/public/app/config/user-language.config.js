(function() {

  function config($localStorage, gettextCatalog, Languages) {
    var navigatorLanguage = navigator.language || navigator.userLanguage;

    if(navigatorLanguage.indexOf(_.map(Languages.getDashboardTranslations(), language => language.code)) < 0) {
      navigatorLanguage = undefined;
    }

    var locale = _.get($localStorage, 'user.settings.locale') || navigatorLanguage || 'en';

    gettextCatalog.debug = false;
    gettextCatalog.setCurrentLanguage(locale);

    moment.locale(locale);
  }

  config.$inject = ['$localStorage', 'gettextCatalog', 'Languages'];

  angular.module('tapinApp')
    .run(config);
})();
