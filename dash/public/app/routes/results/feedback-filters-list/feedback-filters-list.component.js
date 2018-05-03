(function() {

  class FeedbackFiltersList {
    /*@ngInject*/
    constructor(Buttons) {
      this._Buttons = Buttons;
    }

    buttonValueToClass(value) {
      return this._Buttons.buttonValueToClass(value);
    }
  }

  angular.module('tapinApp.components')
    .component('feedbackFiltersList', {
      bindings: {
        filters: '<'
      },
      controller: FeedbackFiltersList,
      controllerAs: 'feedbackFiltersList',
      templateUrl: '/app/routes/results/feedback-filters-list/feedback-filters-list.template.html'
    });

})();
