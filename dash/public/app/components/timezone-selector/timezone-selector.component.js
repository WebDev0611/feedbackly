(function() {

  class TimezoneSelector {
    constructor($scope) {
      this.offsetList = _.chain(_.range(-12,13)).map(offset => offset.toString()).value();

      $scope.$watch(() => this.timeZone, (oldVal, newVal) => {
        if(!newVal) {
          this.timeZone = (moment().utcOffset() / 60).toString();
        } else {
          this.timeZone = this.timeZone.toString();
        }

        this.onTimeZoneChange({ zone: parseInt(this.timeZone) });
      });
    }
  }

  TimezoneSelector.$inject = ['$scope'];

  angular.module('tapinApp.components')
    .component('timezoneSelector', {
      bindings: {
        onTimeZoneChange: '&',
        timeZone: '<'
      },
      template: `
        <div class="input-field">
          <select class="" ng-model="timezoneSelector.timeZone" material-select>
            <option ng-repeat="zone in ::timezoneSelector.offsetList" value="{{::zone}}">UTC {{::zone}}:00</option>
          </select>
          <label translate>Timezone</label>
        </div>
      `,
      controller: TimezoneSelector,
      controllerAs: 'timezoneSelector'
    });

})();
