(function() {

  function config() {
    document.getElementById('loading-screen').style.display = 'none';
  }

  angular.module('tapinApp')
    .run(config);

})();
