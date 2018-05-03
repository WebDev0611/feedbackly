(function() {

  class channelNames {
    /*@ngInject*/
    constructor($filter) {
      this._$filter = $filter;

      this._names = {
        'EMAIL': 'E-mail list',
        'SMS': 'SMS list',
        'DEVICE': 'Feedback kiosk',
        'PLUGIN': 'Website plugin',
        'LINK': 'Survey link',
        'QR': 'QR code'
      }


    }

    channelName(name){
      return this._$filter('translate')(this._names[name]);
    }

  }

  angular.module('tapinApp.services')
    .service('channelNames', channelNames);

})();
