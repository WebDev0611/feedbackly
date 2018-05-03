var Tinylink = require('app-modules/models/tinylink');
var Device = require('app-modules/models/device');
var errors = require('app-modules/errors');
var _ = require('lodash')
module.exports = app => {

  app.get('/l/:code',
    (req, res, next) => {
      Tinylink.getUrl(req.params.code)
        .then(url => {
          if(!url) {
            return next(new errors.NotFoundError());
          } else {
            var newUrl = url.split(process.env.TINY_CLIENT_URL).join(process.env.CLIENT_URL).split(" ").join("").split("http://fbly.io").join("https://survey.feedbackly.com");
            var urlArr = req.url.split("?")
            urlArr.shift() // removes whatever is in front of ?
            if(newUrl.indexOf("?") == -1) var query_string="?"
            else var query_string = "&"
            query_string+=urlArr.join("&")
            return res.redirect(newUrl + query_string);
          }
        });
    });

  app.get('/:udid', (req, res, next) => {
    var udid = req.params.udid

    Device.findOne({udid})
    .then(d => {
      if(d) res.redirect(process.env.CLIENT_URL + '/surveys/' + udid)
      return next(new errors.NotFoundError());
    })
  })

}
