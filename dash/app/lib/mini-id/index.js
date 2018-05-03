var ALPHABET = "8FROXBvnG1Uyl9uLeNWS5JQ3ZcCg0jo24wEKkVqd6f7IsbHDAzmitThPrYpMxa" // "abcdefghijlkmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890" in a shuffled order
var len = ALPHABET.length;
ALPHABET= ALPHABET.split("")


function generate(seed){
  var code = ""
  var big = seed
  do {
    var quotient = big/len;
    var remainder = quotient - Math.floor(quotient)
      code+= ALPHABET[Math.round(remainder*len)]
    big = Math.floor(quotient)

  } while(big != 0)

  return code
}

module.exports = {generate}
