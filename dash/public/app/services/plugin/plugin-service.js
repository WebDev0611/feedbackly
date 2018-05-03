(function() {

  class Plugin {
    /*@ngInject*/
    constructor(Restangular, Toaster, $http) {
      this._Restangular = Restangular;
      this._Toaster = Toaster;
      this._$http = $http;
      this._CLIENT_URL = window.envConfig.CLIENT_URL;

    }
    getHTML(options) {
      var env = window.envConfig.ENV;
      var pluginUrl = window.envConfig.PLUGIN_URL;

      var scriptTag = options.scriptId === undefined
        ? '<script>'
        : `<script id="${options.scriptId}">`;

      var settingsToString = JSON.stringify(options.settings);

      var triggerScript = options.isPreview === true
        ? `window.FEEDBACK_PLUGIN_BOOTSTRAPPER.initialize();`
        : `document.addEventListener('DOMContentLoaded',function(){window.FEEDBACK_PLUGIN_BOOTSTRAPPER.initialize();});`;

      return `${scriptTag}window._FEEDBACK_PLUGIN_LIST=window._FEEDBACK_PLUGIN_LIST||[],window._FEEDBACK_PLUGIN_LIST.push({udid:"${options.udid}",placement:"${options.placement || 'bottom-right'}", display: "${options.display || 'popup'}", settings: ${settingsToString} }),window.FEEDBACK_PLUGIN_BOOTSTRAPPER=function(){return{initialize:function(){var e=document.getElementById("feedback-plugin-script-tag"),t=document.getElementById("feedback-plugin-style-tag");e||(e=document.createElement("script"),e.id="feedback-plugin-script-tag",e.src="${window.envConfig.PLUGIN_JS_URL}",document.getElementsByTagName("body")[0].appendChild(e)),t||(t=document.createElement("link"),t.id="feedback-plugin-style-tag",t.setAttribute("href","${window.envConfig.PLUGIN_CSS_URL}"),t.setAttribute("rel","stylesheet"),t.setAttribute("type","text/css"),document.getElementsByTagName("head")[0].appendChild(t))}}}();${triggerScript}</script>`
    }

    getPluginScriptForDevice(udid, noinit = true) {
      return this._$http.get(`${this._CLIENT_URL}/plugin/${udid}/script.js?noinit=${noinit}`)
      .then(data => {
        if(!noinit) return data.data + `\n var plugin_${udid.split('-').join("_")}= new Fbly("${udid}");`
          else return data.data;
      })
    }

    getEmbeddingElement(udid){
      return `<div class="feedback-plugin-container-${udid}"></div>`
    }

    createPreview(options) {
      window._FEEDBACK_PLUGIN_PREVIEW = true;
      window._FEEDBACK_PLUGIN_PREVIEW_SURVEY_ID = options.surveyId;
      window._FEEDBACK_PLUGIN_PREVIEW_PLACEMENT = options.placement;

      $('body').append(this.getHTML(_.assign({ scriptId: 'plugin-preview-script', isPreview: true }, options)));
    }

    removePreview() {
      delete window._FEEBACK_PLUGIN_PREVIEW;
      delete window._FEEDBACK_PLUGIN_PREVIEW_SURVEY_ID;
      delete window._FEEDBACK_PLUGIN_PREIVEW_PLACEMENT;

      $('#plugin-preview-script').remove();
      $('#feedback-plugin-script-tag').remove();
      $('.feedback-plugin-pop-up-container').remove();
    }


  }

  angular.module('tapinApp.services')
    .service('Plugin', Plugin);

})();
