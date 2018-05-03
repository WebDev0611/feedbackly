(function() {

  class Languages {
    constructor(LanguageMapping) {
      this._languageMap = LanguageMapping.languageMap;
      this._languageArray = LanguageMapping.languageArray;
    }

    getDashboardTranslations() {
      return [
        { flag: 'fi', text: 'Suomi', code: 'fi' },
        { flag: 'gb', text: 'English', code: 'en' },
        { flag: 'se', text: 'Swedish', code: 'sv' },
        { flag: 'es', text: 'Spanish', code: 'es' }
      ];
    }

    getLanguages(){
      return this._languageArray;
    }

    languageToFlag(code){
      return _.get(this._languageMap[code], "flag") || ""
    }

    getLanguageName(code){
      return _.get(_.find(this._languageArray, {code}), 'languageName') || ""
    }
  }

  Languages.$inject = ['LanguageMapping'];

  angular.module('tapinApp.services')
    .service('Languages', Languages);

})();
