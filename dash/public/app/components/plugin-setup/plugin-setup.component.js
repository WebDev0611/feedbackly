(function() {

  class PluginSetup {
    /*@ngInject*/
    constructor(Plugin, clipboard, Toaster, $sce) {
      this._Plugin = Plugin;
      this._clipboard = clipboard;
      this._Toaster = Toaster;
      this._$sce = $sce;

      var settings = _.get(this.channel, "settings.pluginSettings") || {}
      const defaults = {
        placement: "bottom-right",
        display: "popup",
        sampleRatio: 1,
        showAfterSecondsOnPage: 0,
        showAfterSecondsOnSite: 0,
        showAfterVisitedPages: 0,
        hiddenAfterClosedForHours: 24,
        hiddenAfterFeedbackForHours: 24,
        afterPercentage: 0,
        exitTrigger: false,
        urlPatterns: {mode: "single", rules: []},
        excludeUrls:[],
      }
      _.set(this, 'channel.settings.pluginSettings', _.assign({}, defaults, settings));
    
      this.pluginSettings = this.channel.settings.pluginSettings;

      this._ratioRanges = [
        [[0.0,0.1], [0.00,0.001]], // slider, percentage
        [[0.1,0.3], [0.001,0.01]],
        [[0.3,1.0], [0.01,1.00]]
      ]

      this.newUrlPattern = ""
      this.hiddenURL=""

      this.onSettingsChange();
      this.feedbackCompletedHoursSlider = true;
      this.feedbackClosedHoursSlider = true;
      this.initialSlider()
    }
    initialSlider(){
      if (this.pluginSettings.hiddenAfterFeedbackForHours == 99999999) this.feedbackCompletedHoursSlider = false;
      if (this.pluginSettings.hiddenAfterClosedForHours == 99999999) this.feedbackClosedHoursSlider = false;
    }
    toggleSlider(checkbox){
      checkbox === 'range2' ? 
        this.feedbackCompletedHoursSlider = !this.feedbackCompletedHoursSlider :
        this.feedbackClosedHoursSlider = !this.feedbackClosedHoursSlider;
        if(!this.feedbackCompletedHoursSlider) this.pluginSettings.hiddenAfterFeedbackForHours = 99999999;
        if(!this.feedbackClosedHoursSlider) this.pluginSettings.hiddenAfterClosedForHours = 99999999;
        this.onSettingsChange()
    }

    convertValue(value, ratioRanges, fromIndex, toIndex) {
      if(!_.isNumber(value)) return 1;
      for(var i = 0; i < ratioRanges.length; i++) {
        var fromRange = ratioRanges[i][fromIndex];
        var toRange = ratioRanges[i][toIndex];

        if(value+1e-6 >= fromRange[0] && value-1e-6 <=fromRange[1]) {
          value = (value - fromRange[0])/(fromRange[1]-fromRange[0]);
          return (toRange[1]-toRange[0]) * value + toRange[0];
        }
      }
    }


    unlinearizeRatio(f) {
      return this.convertValue(f,this._ratioRanges,1,0);
    }

    linearizeRatio(f) {
      return this.convertValue(f,this._ratioRanges, 0,1);
    }

    onSettingsChange() {
      this.pluginSettings.showAfterSecondsOnPage = parseInt(this.pluginSettings.showAfterSecondsOnPage)
      this.pluginSettings.showAfterSecondsOnSite = parseInt(this.pluginSettings.showAfterSecondsOnSite)
      this.pluginSettings.hiddenAfterClosedForHours = parseInt(this.pluginSettings.hiddenAfterClosedForHours)
      this.pluginSettings.hiddenAfterFeedbackForHours = parseInt(this.pluginSettings.hiddenAfterFeedbackForHours)
      this.pluginSettings.showAfterVisitedPages = parseInt(this.pluginSettings.showAfterVisitedPages)
      this.pluginSettings.afterPercentage = parseInt(this.pluginSettings.afterPercentage)
      if(!('sampleRatio' in this.pluginSettings)) this.sampleRatioNonlinear = 1;
      else this.sampleRatioNonlinear = this.unlinearizeRatio(parseFloat(this.pluginSettings.sampleRatio))

      this._setSource();
      this._setPlacementSource();
    }

    onRatioChange() {
      this.pluginSettings.sampleRatio = this.linearizeRatio(parseFloat(this.sampleRatioNonlinear));
      this.onSettingsChange()
    }

    copyToClipboard(source) {
      this._clipboard.copyText(source);
      this._Toaster.success('Plugin code has been copied to clipboard')
    }

    addUrlPattern() {
      this.pluginSettings.urlPatterns.rules.push(this.newUrlPattern);
      this.newUrlPattern = ""
      this.onSettingsChange();
    }

    removeUrlPattern(index) {
      this.pluginSettings.urlPatterns.rules.splice(index, 1);
      this.onSettingsChange();
    }

    _setPlacementSource() {
      this.placementSource = this._$sce.trustAsHtml(
        `<div class="feedback-plugin-container-${this.channel.udid}"></div>`
      );
    }

    _setSource() {
      this._Plugin.getPluginScriptForDevice(this.channel.udid).then(text => {
        var source = `<script>\n${text}\n</script>`;
        this.mainSource = this._$sce.trustAsHtml(source);
        var channelSource = `<script>\nvar plugin_${this.channel.udid.split("-").join("_")} = new Fbly("${this.channel.udid}");\n</script>`;
        this.channelSource = this._$sce.trustAsHtml(channelSource);
      })
    }

    hideOnlyPattern(){
      if(this.hiddenURL.length > 0){
      this.pluginSettings.excludeUrls.push(this.hiddenURL); // let's not make this case-insensitive either, because urls are case-sensitive
      this.hiddenURL='';

      this.onSettingsChange();
      }
    }
    removeExcludedUrlPattern(index){
      this.pluginSettings.excludeUrls.splice(index, 1);
      
      this.onSettingsChange();
    }
    
  }

  angular.module('tapinApp.components')
    .component('pluginSetup', {
      bindings: {
        channel: "=",
        saveSettings: "&",
        hideSave: "@"
      },
      controller: PluginSetup,
      controllerAs: 'pluginSetup',
      templateUrl: '/app/components/plugin-setup/plugin-setup.template.html'
    })

angular.module('tapinApp.filters')
.filter('formatPercentage', ['$filter', function ($filter) {
  return function (input) {
    if(input<0.001) return $filter('number')(input * 100, 3) + '%';
    if(input<0.01 ) return $filter('number')(input * 100, 2) + '%';
    return $filter('number')(input*100,0)+'%';

  };
}]);
})();