(function() {

  class DeviceInfo {
    /*@ngInject*/
    constructor($scope, deviceConstants, Files) {
      if(this.isSchedulateable === 'true') {
        this._getSchedulations();
      }

      if(this.device.type === deviceConstants.deviceTypes.QR) {
        this.hasQr = true;
        this.qrFileName = _.kebabCase(this.device.name);
      }

      if(this.device.type === deviceConstants.deviceTypes.DEVICE) {
        this.hasPasscode = true;
        this.hasAuthCode = true;
      }

      if(this.device.type === deviceConstants.deviceTypes.LINK) {
        this.hasLink = true;
      }

      this.usersWithRightToDevice = _.map(this.device.usersWithRightToDevice || [], user => user.email).join(', ');

      this._Files = Files;
    }

    downloadQr(link) {
      this._Files.textToQrCode(link);
    }

    _getSchedulations() {
      this.device.all('schedulations').getList()
        .then(schedulations => {
          var asArray = _.map(schedulations, schedulation => `${schedulation.survey_id.name} ${moment.utc(schedulation.date * 1000).format('DD.MM.YYYY H:mm')} ${schedulation.utc_offset} UTC`);

          this.schedulations = asArray.length === 0
            ? undefined
            : asArray.join(',');
        });
    }
  }

  angular.module('tapinApp.components')
    .component('deviceInfo', {
      bindings: {
        device: '<',
        numberOfMembers: '<',
        isSchedulateable: '@'
      },
      controller: DeviceInfo,
      controllerAs: 'deviceInfo',
      templateUrl: '/app/components/device-info/device-info.template.html'
    });

})();
