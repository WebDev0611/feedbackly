(function() {

  angular.module('signUpApp.components')
    .component('loader', {
      bindings: {
        loading: '='
      },
      controllerAs: 'loader',
      template: `
        <div ng-if="loader.loading" class="center-align">
          <div class="preloader-wrapper active">
            <div class="spinner-layer spinner-blue-only">
              <div class="circle-clipper left">
                <div class="circle"></div>
              </div><div class="gap-patch">
                <div class="circle"></div>
              </div><div class="circle-clipper right">
                <div class="circle"></div>
              </div>
            </div>
          </div>
        </div>
      `
    });

})();
