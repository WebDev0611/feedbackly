(function() {

  class LanguageMapping {
    constructor(){
      this.languageMap = {
             "af":{
                "flag":"za",
                "languageName":"Afrikaans "
             },
             "be":{
                "flag":"by",
                "languageName":"Belarusian "
             },
             "bg":{
                "flag":"bg",
                "languageName":"Bulgarian "
             },
             "ca":{
                "flag":"es",
                "languageName":"Catalan "
             },
             "cs":{
                "flag":"cz",
                "languageName":"Czech "
             },
             "da":{
                "flag":"dk",
                "languageName":"Danish "
             },
             "de":{
                "flag":"de",
                "languageName":"German "
             },
             "div":{
                "flag":"vmv",
                "languageName":"Dhivehi "
             },
             "el":{
                "flag":"gr",
                "languageName":"Greek "
             },
             "en":{
                "flag":"gb",
                "languageName":"English "
             },
             "es":{
                "flag":"es",
                "languageName":"Spanish "
             },
             "et":{
                "flag":"ee",
                "languageName":"Estonian "
             },
             "eu":{
                "flag":"es",
                "languageName":"Basque "
             },
             "fa":{
                "flag":"ir",
                "languageName":"Farsi "
             },
             "fi":{
                "flag":"fi",
                "languageName":"Finnish "
             },
             "fo":{
                "flag":"fo",
                "languageName":"Faroese "
             },
             "fr":{
                "flag":"fr",
                "languageName":"French "
             },
             "gl":{
                "flag":"es",
                "languageName":"Galician "
             },
             "gu":{
                "flag":"in",
                "languageName":"Gujarati "
             },
             "he":{
                "flag":"il",
                "languageName":"Hebrew "
             },
             "hi":{
                "flag":"in",
                "languageName":"Hindi "
             },
             "hr":{
                "flag":"hr",
                "languageName":"Croatian "
             },
             "hu":{
                "flag":"hu",
                "languageName":"Hungarian "
             },
             "hy":{
                "flag":"am",
                "languageName":"Armenian "
             },
             "id":{
                "flag":"id",
                "languageName":"Indonesian "
             },
             "is":{
                "flag":"is",
                "languageName":"Icelandic "
             },
             "it":{
                "flag":"it",
                "languageName":"Italian "
             },
             "ja":{
                "flag":"jp",
                "languageName":"Japanese "
             },
             "kk":{
                "flag":"kz",
                "languageName":"Kazakh "
             },
             "kn":{
                "flag":"in",
                "languageName":"Kannada "
             },
             "ko":{
                "flag":"kr",
                "languageName":"Korean "
             },
             "kok":{
                "flag":"kin",
                "languageName":"Konkani "
             },
             "ky":{
                "flag":"kz",
                "languageName":"Kyrgyz "
             },
             "lt":{
                "flag":"lt",
                "languageName":"Lithuanian "
             },
             "lv":{
                "flag":"lv",
                "languageName":"Latvian "
             },
             "mk":{
                "flag":"mk",
                "languageName":"Macedonian "
             },
             "mn":{
                "flag":"mn",
                "languageName":"Mongolian "
             },
             "mr":{
                "flag":"in",
                "languageName":"Marathi "
             },
             "ms":{
                "flag":"my",
                "languageName":"Malay "
             },
             "nb":{
                "flag":"no",
                "languageName":"Norwegian (Bokmål) "
             },
             "nl":{
                "flag":"nl",
                "languageName":"Dutch "
             },
             "nn":{
                "flag":"no",
                "languageName":"Norwegian (Nynorsk) "
             },
             "pa":{
                "flag":"in",
                "languageName":"Punjabi "
             },
             "pl":{
                "flag":"pl",
                "languageName":"Polish "
             },
             "pt":{
                "flag":"pt",
                "languageName":"Portuguese "
             },
             "ro":{
                "flag":"ro",
                "languageName":"Romanian "
             },
             "ru":{
                "flag":"ru",
                "languageName":"Russian "
             },
             "sa":{
                "flag":"in",
                "languageName":"Sanskrit "
             },
             "sk":{
                "flag":"sk",
                "languageName":"Slovak "
             },
             "sl":{
                "flag":"si",
                "languageName":"Slovenian "
             },
             "sq":{
                "flag":"al",
                "languageName":"Albanian "
             },
             "sv":{
                "flag":"se",
                "languageName":"Swedish "
             },
             "sw":{
                "flag":"ke",
                "languageName":"Swahili "
             },
             "ta":{
                "flag":"in",
                "languageName":"Tamil "
             },
             "te":{
                "flag":"in",
                "languageName":"Telugu "
             },
             "th":{
                "flag":"th",
                "languageName":"Thai "
             },
             "tr":{
                "flag":"tr",
                "languageName":"Turkish "
             },
             "tt":{
                "flag":"ru",
                "languageName":"Tatar "
             },
             "uk":{
                "flag":"ua",
                "languageName":"Ukrainian "
             },
             "ur":{
                "flag":"pk",
                "languageName":"Urdu "
             },
             "vi":{
                "flag":"vn",
                "languageName":"Vietnamese "
             },
             "zh":{
                "flag":"cn",
                "languageName":"Chinese "
             }
          };

        // OWN ADDITION
        this.languageMap["ar"] = {"flag": "arabic","languageName": "Arabic"}


        this.languageArray = [];
        _.forEach(_.sortBy(_.keys(this.languageMap)), key => {
          var o = _.assign({code: key}, this.languageMap[key]);
          this.languageArray.push(o)
        })

    }

  }

  angular.module('tapinApp.services')
    .service('LanguageMapping', LanguageMapping);

})();
