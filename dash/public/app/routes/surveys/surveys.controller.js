(function() {

  class SurveysController {
    /*@ngInject*/
    constructor($state) {
      this.state = $state;
    }

    clickStateLink(state){
      this.state.go(state, this.state.params);
    }
  }

  angular.module('tapinApp.routes')
    .controller('SurveysController', SurveysController)

})();
