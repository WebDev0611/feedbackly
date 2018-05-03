var yaml = require('yamljs');
var fs = require('fs');
var _ = require('lodash');
console.error("Paste JSON from Google Sheets > Export JSON > This Sheet and press CTRL+D");
var json = JSON.parse(fs.readFileSync('/dev/stdin').toString());


var keyMap = {
  "next": "next",
  "required": "required",
  "returningToBeginningInSeconds": "returnText",
  "dragHere": "sliderHelper",
  "privacyPolicyTerms": "privacyPolicy"
};



var obj = {};

_.values(keyMap).forEach( t => obj[t] = {});

json.forEach( j => {
  _.forEach(keyMap, (v, k) => {
    if(k in j) obj[v][j.code] = j[k];
  })
})

console.log(yaml.stringify(obj,2));
