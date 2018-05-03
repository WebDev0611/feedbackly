(function() {

  function humanize() {
    return function humanize(number) {
        if(isNaN(parseFloat(number))) {
          return 0;
        }

        if(number < 1000) {
          return number;
        } else if(number > 1000 && number < 10000) {
          var inThousands = number / 1000;
          return `${Math.round(inThousands * 100) / 100}K`;
        } else {
          var si = ['K', 'M', 'G', 'T', 'P', 'H'];
          var exp = Math.floor(Math.log(number) / Math.log(1000));
          var result = number / Math.pow(1000, exp);
          result = (result % 1 > (1 / Math.pow(1000, exp - 1))) ? result.toFixed(2) : result.toFixed(0);
          return result + si[exp - 1];
        }    
    };
  }

  angular.module('tapinApp.filters').filter('humanize', humanize);

})();
