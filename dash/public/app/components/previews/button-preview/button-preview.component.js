(function() {

  class ButtonPreview {
    /*@ngInject*/
    constructor(Buttons) {
      this._Buttons = Buttons;

      var titles = this._Buttons.buttonTitles({ buttonCount: this.question.opts.buttonCount });
      var images = this._Buttons.buttonImages(_.pick(this.question.opts, ['colored', 'buttonCount']));

      this.buttonValues = _.map(titles, (title, index) => { return { title: title, image: images[index] } });
    }
  }

  angular.module('tapinApp.components')
    .component('buttonPreview', {
      bindings: {
        translation: '<',
        question: '<'
      },
      controller: ButtonPreview,
      controllerAs: 'buttonPreview',
      templateUrl: '/app/components/previews/button-preview/button-preview.template.html'
    });

})();
