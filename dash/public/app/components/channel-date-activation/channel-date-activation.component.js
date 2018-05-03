(function() {

  class ChannelDateActivation {
    /*@ngInject*/
    constructor($scope) {
      this.hourList = _.range(0, 24);
      this.minuteList = [0, 30];

      if(this.date !== undefined) {
        var timestamp = this.date * 1000;

        this.hours = moment.utc(timestamp).hours().toString();
        this.minutes = moment.utc(timestamp).minutes().toString();
        this.day = moment.utc(timestamp).startOf('day').toDate();
      } else {
        this.hours = '12';
        this.minutes = '0';
        this.day = moment().add(1, 'days').toDate();
      }

      $scope.$watch(() => this.day, () => this.dateToUtc())
    }

    onOffsetChange(zone) {
      this.timeZone = zone;

      this.onTimeZoneChange({ zone: this.timeZone });

      this.dateToUtc();
    }

    dateToUtc() {
      var date;

      if(typeof this.day === 'object') {
        date = moment.utc(this.day).format('DD.MM.YYYY');
      } else {
        date = moment.utc(this.day, 'DD.MM.YYYY').format('DD.MM.YYYY');
      }

      var unix = moment.utc(`${date} ${this.hours}:${this.minutes}`, 'DD.MM.YYYY H:m').unix();

      if(!isNaN(unix)) {
        this.onDateChange({ date: unix });
      }
    }
  }

  angular.module('tapinApp.components')
    .component('channelDateActivation', {
      bindings: {
        date: '<',
        timeZone: '<',
        onDateChange: '&',
        onTimeZoneChange: '&',
      },
      template: `
        <div class="row">
          <div class="col s12 l6">
            <div class="input-field">
              <input input-date
                type="text"
                ng-model="dateActivation.day"
                format="dd.mm.yyyy"
              />

              <label translate>Date</label>
            </div>
          </div>

          <div class="col s12 l2">
            <div class="input-field" input-field>
              <select class="" ng-model="dateActivation.hours" material-select ng-change="dateActivation.dateToUtc()">
                <option ng-repeat="hour in ::dateActivation.hourList" value="{{::hour}}">{{hour}}</option>
              </select>
              <label translate>Hours</label>
            </div>
          </div>

          <div class="col s12 l2">
            <div class="input-field" input-field>
              <select class="" ng-model="dateActivation.minutes" ng-change="dateActivation.dateToUtc()" material-select>
                <option ng-repeat="minute in ::dateActivation.minuteList" value="{{::minute}}">{{minute}}</option>
              </select>
              <label translate>Minutes</label>
            </div>
          </div>

          <div class="col s12 l2">
            <timezone-selector on-time-zone-change="dateActivation.onOffsetChange(zone)" time-zone="dateActivation.timeZone"></timezone-selector>
          </div>
        </div>
      `,
      controller: ChannelDateActivation,
      controllerAs: 'dateActivation'
    })

})();
