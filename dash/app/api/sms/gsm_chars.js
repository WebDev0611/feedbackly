var chars = ` @£$¥èéùìòÇØøÅåΔ_ΦΓΛΩΠΨΣΘΞ^{}\[~]|€ÆæßÉ!"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà`;
function isGSM7(str){
  var isGSM7 = true;
  str.split('').forEach(char => { chars.indexOf(char) > -1 ? '' : isGSM7 = false})
  return isGSM7;
}

module.exports = { isGSM7 };
