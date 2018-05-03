const request = require('request');
const Promise = require('bluebird');
const _ = require('lodash')
function check(path, label){
  return new Promise((resolve, reject) => {
    request(path, function (error, response, body) {
      console.log(label)
      console.log('error:', error); // Print the error if one occurred
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received

      resolve({status: _.get(response, 'statusCode') || 404, error: error, name: label})

    });
  })
}

module.exports = {check}
