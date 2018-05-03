(function() {

  class DeviceIcons {
    /*@ngInject*/
    constructor() {
    }

    getIcon(type){
      var icons = {
        DEVICE: 'tablet',
        PLUGIN: 'code',
        LINK: 'link',
        QR: 'smartphone',
        EMAIL: 'email',
        SMS: 'message'
      }
      var icon = icons[type];
      return `<i class="device-type material-icons">${icon}</i>`
    }

  }

  angular.module('tapinApp.services')
    .service('DeviceIcons', DeviceIcons);

})();
