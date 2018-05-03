(function() {

  class UserController {
    constructor($state) {
      this.state = $state;
    }
  }

  UserController.$inject = ['$state'];

  angular.module('tapinApp.routes')
    .controller('UserController', UserController);

})();
