(function() {
  var chars = ` @£$¥èéùìòÇØøÅåΔ_ΦΓΛΩΠΨΣΘΞ^{}\[~]|€ÆæßÉ!"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà`;
  class Gsm7 {
     isGSM7(string){
      var isGSM7 = true;
      string.split('').forEach(char => { chars.indexOf(char) > -1 ? '' : isGSM7 = false})
      return isGSM7;
    }

  }

  angular.module('tapinApp.services')
    .service('Gsm7', Gsm7);

})();
