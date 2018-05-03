(function() {

  class Flag {
    constructor() {}

  }

  angular.module('tapinApp.components')
    .component('flag', {
      bindings: {
        width: "@",
        code: '=',
        class: "@"
      },
      controller: Flag,
      controllerAs: 'flag',
      template: `

      <div ng-if="flag.code.length > 0" class='flag-container {{flag.class}}' style="width: {{flag.width}}">
        <img class='spacer' src='/flag-sprites/spacer.png'>
        <img class='flag flag-{{flag.code}}' src='/flag-sprites/flag-sprites.png'>
      </div>

      `
    })

})();
