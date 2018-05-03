(function() {

  class LocaleText {
    /*@ngInject*/
    constructor(UserStore){
        this._UserStore = UserStore;
    }
    
    getText(text) {
        var locale = this._UserStore.getLocale();
        if(locale in text) return text[locale];
        if('en' in text) return text['en'];
        return _.find(text);
    }
  }
  angular.module('tapinApp.services')
    .service('LocaleText', LocaleText);

})();