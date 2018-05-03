(function() {

  angular.module('tapinApp.components')
    .component('loader', {
      bindings: {
        loading: '<'
      },
      controllerAs: 'loader',
      template: `
        <div ng-if="loader.loading" class="center-align">
          <div class="feedbackly-loader-wrapper animating">
            <div class="loader-bar loader-bar-1"></div>
            <div class="loader-bar loader-bar-2"></div>
            <div class="loader-bar loader-bar-3"></div>
            <div class="loader-bar loader-bar-4"></div>
          </div>
        </div>
      `
    });

})();
