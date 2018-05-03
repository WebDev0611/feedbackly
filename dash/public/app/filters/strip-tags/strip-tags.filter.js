(function() {

  function stripTags() {
    return function stripTags(text) {
      return  text ? String(text).replace(/<[^>]+>/gm, '') : '';
    };
  }

  angular.module('tapinApp.filters').filter('stripTags', stripTags);

})();
