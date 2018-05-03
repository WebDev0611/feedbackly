(function() {

  function tutorialCards(Restangular, UserStore) {
    return {
      scope: {
        finishedTutorials: '@',
        tutorialId: '@'
      },
      restrict: 'A',
      link: (scope, elem, attrs) => {
        var allClasses = "back0 back1 back2 back3 back4 back5 back6"

        var currentCardIndex = 0;
        var $elem = $(elem);
        var cards = $elem.find('.card-outer');
        if(scope.finishedTutorials.indexOf(scope.tutorialId) == -1){
          $elem.removeClass('hide');
        } else return;

        var updateCardClasses = () => {
          cards.each(function(){
            var t = $(this);
            if(t.index() < currentCardIndex) t.addClass('fly-out')
            t.removeClass(allClasses);
            t.addClass("back" + (t.index()-currentCardIndex))
          })
        }

        var nextCard = () => {
          currentCardIndex++;

          if(currentCardIndex + 1 === cards.length) {
            var currentUser = UserStore.getUserSignedIn();

            Restangular
              .one('users', currentUser._id)
              .all('finish_tutorial')
              .post({id: scope.tutorialId});

              window.TUTORIALS_FINISHED.push(scope.tutorialId);


              setTimeout(function(){
                window.Intercom('update');
              }, 5000);

          }

          updateCardClasses()
        }

        var previousCard =() => {
          currentCardIndex--;
          updateCardClasses()
          cards.eq(currentCardIndex).removeClass('fly-out')
        }

        var closeCards = () => {
          $elem.addClass('hide')
        }

        updateCardClasses()


        $elem.find('.next').on('click', nextCard)
        $elem.find('.previous').on('click', previousCard)
        $elem.find('i.x').on('click', closeCards)
        $elem.find('.close').on('click', closeCards)
      }
    }
  }

  tutorialCards.$inject = ['Restangular', 'UserStore'];

  angular.module('tapinApp.components')
    .directive('tutorialCards', tutorialCards);

})();
