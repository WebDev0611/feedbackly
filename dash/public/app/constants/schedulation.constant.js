(function() {

  var schedulationConstants = {
    schedulationTypes: {
      EMAIL: 'EMAIL',
      ACTIVATION: 'ACTIVATION',
      SMS: 'SMS'
    }
  };

  angular.module('tapinApp')
    .constant('schedulationConstants', schedulationConstants);

})();
