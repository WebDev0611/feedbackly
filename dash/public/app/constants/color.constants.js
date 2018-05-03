(function() {

  var colorConstants = {};

  colorConstants.primaryColors = {
    RED: '#fe767c',
    YELLOW: '#ffda6c',
    GREEN: '#97d149',
    ORANGE: '#FFA363',
    TEAL: '#2fbca4',
    BLUE: '#4aa3df',
    DARK_GREY: '#83859B'
  };

  colorConstants.NPS_COLORS = ["#ac353a","#d13f43","#d85248","#de6f4e","#e58a55","#EAA050","#f3af46","#f5b850","#babc34","#a2bd5a","#79af57"];

  colorConstants.RANDOM_COLORS = ["#30548e","#dd5e28","#eecf46","#779e31","#7b1e2b","#9fcaf3","#414b14","#bbc833", "#0e8f45", "#8ac75d","#fcc919","#f37731","#e84d3d"];

  angular.module('tapinApp')
    .constant('colorConstants', colorConstants);

})();
