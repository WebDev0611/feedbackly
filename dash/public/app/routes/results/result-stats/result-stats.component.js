(function() {

  class ResultStats {
    constructor() {}

    organizationDifference(target) {
      return this.organization.now[target] - this.organization.before[target];
    }

    channelsDifference(target) {
      return this.channels.now[target] - this.channels.before[target];
    }

    getArrow(scope, target) {
      var difference = this[scope].now[target] - this[scope].before[target]

      if(difference >= 0) {
        return 'keyboard_arrow_up';
      } else {
        return 'keyboard_arrow_down';
      }
    }

    isTwoColumn() {
      return this.organization.now.average !== undefined || this.organization.now.nps !== undefined;
    }
  }

  angular.module('tapinApp.components')
    .component('resultStats', {
      bindings: {
        organization: '<',
        channels: '<'
      },
      controller: ResultStats,
      controllerAs: 'resultStats',
      templateUrl: '/app/routes/results/result-stats/result-stats.template.html'
    });

})();
