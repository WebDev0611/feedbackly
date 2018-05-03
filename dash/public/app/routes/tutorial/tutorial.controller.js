(function() {

  class TutorialController {
    /*@ngInject*/
    constructor($scope, Restangular, UserStore) {
      this.imageUrls = ['/images/tutorial-full/survey-editor.jpg',
        '/images/tutorial-full/survey-editor.jpg',
        '/images/tutorial-full/channel-creation.jpg',
        '/images/tutorial-full/email-settings.jpg',
        '/images/tutorial-full/publish-settings.jpg',
        '/images/tutorial-full/review.jpg',
        '/images/tutorial-full/analyzing.jpg',
        '/images/tutorial-full/thanks.png'

      ]
      this._UserStore = UserStore;
      this._Restangular = Restangular;
      this._$scope = $scope;
      this.phaseNumber = 0;
      var largestHeight = 0;
      var polling = setInterval(() => {
        if($(".text-container .phase-text").last().height() > 1){
          clearInterval(polling);
          $(".text-container .phase-text").each(function(){
            largestHeight = $(this).height() > largestHeight ? $(this).height() : largestHeight
          })
          $(".text-container .phase-text").css("min-height", (largestHeight+15) + "px")

          this.phaseNumber = 1;
          this._$scope.$apply();
        }
      }, 100);


    }

    forward(){
      var el = $(".animate");
      el.addClass("fade-out")
      setTimeout(() => el.removeClass("fade-out").addClass("fade"), 250)
      setTimeout(() => { el.removeClass("fade").addClass("fade-in")}, 400)
      setTimeout(() => { this.phaseNumber++; this._$scope.$apply()}, 400)
      setTimeout(() => el.removeClass("fade-in"), 750)

      if(this.phaseNumber === this.imageUrls.length-2){
        this.updateTutorialFinished();
      }
    }

    backward(){
      var el = $(".animate");
      el.addClass("fade-out")
      setTimeout(() => el.removeClass("fade-out").addClass("fade"), 250)
      setTimeout(() => { el.removeClass("fade").addClass("fade-in")}, 400)
      setTimeout(() => { this.phaseNumber--; this._$scope.$apply()}, 400)
      setTimeout(() => el.removeClass("fade-in"), 750)
    }

    updateTutorialFinished(){
      var currentUser = this._UserStore.getUserSignedIn();

      this._Restangular
        .one('users', currentUser._id)
        .all('finish_tutorial')
        .post({id: "summary"});

        window.TUTORIALS_FINISHED.push("summary");


        setTimeout(function(){
          window.Intercom('update');
        }, 5000);
    }


  }

  angular.module('tapinApp.routes')
    .controller('TutorialController', TutorialController)

})();
