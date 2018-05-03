(function() {

  class TutorialBubble {
    /*@ngInject*/
    constructor($filter, $window, Restangular, UserStore, $scope) {
      this._$filter = $filter;

      var currentUser = UserStore.getUserSignedIn();
      this.show = (!!currentUser.ipad_user === !!this.ipad) && !$window.TUTORIALS_FINISHED.includes(this.item);
//      this.show = true
      this.boxStyle = `bottom: ${this.offset || 0}px`;
      if(this.show) {
        Restangular
          .one('users', currentUser._id)
          .all('finish_tutorial')
          .post({id: this.item});

        $window.TUTORIALS_FINISHED.push(this.item);
      }


    }
    dismiss() {
      this.show = false;
    }


  }

  angular.module('tapinApp.components')
    .component('tutorialBubble', {
      bindings: {
        text: '<',
        item: '<',
        ipad: '<',
        offset: '<'

      },
      templateUrl: '/app/components/tutorial-bubble/tutorial-bubble.template.html',
      controller: TutorialBubble,
      controllerAs: 'tutorialBubble'
    })

})();
