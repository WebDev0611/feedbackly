(function() {

  class ChannelSetupInfo {
    /*@ngInject*/
    constructor(Files, Plugin, $sce) {
      this._Files = Files;
      this._Plugin = Plugin;
      this._$sce = $sce;

      if(this.channel.type == 'PLUGIN'){
        this.pluginScript = "";
        this._getCode(this.channel.udid)
      }

    }
    downloadQr(link) {
      this._Files.textToQrCode(link);
    }

    _getCode(deviceId){
      this._Plugin.getPluginScriptForDevice(deviceId, false)
      .then(code => this.pluginScript = code);
    }

    getPluginEmbeddingElement(udid){
      return this._Plugin.getEmbeddingElement(udid)
    }


  }

  angular.module('tapinApp.components')
    .component('channelSetupInfo', {
      bindings: {
        channel: '<'
      },
      templateUrl: '/app/components/channel-setup-info/channel-setup-info.template.html',
      controller: ChannelSetupInfo,
      controllerAs: 'channelSetupInfo'
    })

})();
