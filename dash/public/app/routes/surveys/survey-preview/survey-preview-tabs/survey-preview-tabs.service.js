(function() {

  class SurveyPreviewTabs {
    /*@ngInject*/
    constructor(deviceConstants) {
      this._previews = {
        'IPAD': {
          id: 'IPAD',
          name: 'Feedback kiosk',
          state: 'surveys.preview.ipadPreview'
        },
        'MOBILE': {
          id: 'MOBILE',
          name: 'Mobile',
          state: 'surveys.preview.mobilePreview'
        },
        'WEB': {
          id: 'WEB',
          name: 'Web form',
          state: 'surveys.preview.webPreview'
        },
        'PLUGIN': {
          id: 'PLUGIN',
          name: 'Website survey',
          state: 'surveys.preview.pluginPreview'
        }
      };

      this._previewOrder = ['IPAD', 'MOBILE', 'WEB', 'PLUGIN'];

      this._typeToPreview = {
        [deviceConstants.deviceTypes.DEVICE]: 'IPAD',
        [deviceConstants.deviceTypes.QR]: 'MOBILE',
        [deviceConstants.deviceTypes.EMAIL]: 'WEB',
        [deviceConstants.deviceTypes.LINK]: 'WEB',
        [deviceConstants.deviceTypes.SMS]: 'MOBILE',
        [deviceConstants.deviceTypes.PLUGIN]: 'PLUGIN'
      };
    }

    getTabsForTypes(types) {
      var requiredPreviews = _.chain(types).map(type => this._typeToPreview[type]).uniq().value();

      return _.chain(this._previewOrder).filter(preview => requiredPreviews.indexOf(preview) >= 0).map(preview => this._previews[preview]).value();
    }

    getTabsForAllTypes(){
      return _.values(this._previews)
    }
  }

  angular.module('tapinApp.services')
    .service('SurveyPreviewTabs', SurveyPreviewTabs);

})();
