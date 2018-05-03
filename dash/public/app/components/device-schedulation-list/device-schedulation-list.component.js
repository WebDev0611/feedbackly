(function() {

  class DeviceSchedulationList {
    constructor(Restangular) {
      this._Restangular = Restangular;

      this._Restangular
        .one('surveys', this.survey._id)
        .all('schedulations')
        .getList({ type: this.type })
        .then(schedulations => {

          schedulations.forEach(schedulation => {
            schedulation.date = moment.utc(schedulation.date * 1000).format('DD.MM.YYYY H:mm');
            schedulation.channelNames = _.map(schedulation.device_ids, channel => channel.name).join(', ');
          });

          this.schedulations = schedulations;
        });
    }
  }

  DeviceSchedulationList.$inject = ['Restangular'];

  angular.module('tapinApp.components')
    .component('deviceSchedulationList', {
      bindings: {
        survey: '<',
        type: '@'
      },
      controller: DeviceSchedulationList,
      controllerAs: 'schedulationList',
      templateUrl: '/app/components/device-schedulation-list/device-schedulation-list.template.html'
    });

})();
