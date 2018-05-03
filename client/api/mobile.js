var _ = require('lodash')

function redirect(req, res){
  var udid;
  udid = _.get(req, 'params.udid.length') > 0 ? req.params.udid : udid;
  udid = _.get(req, 'query.udid.length') > 0 ? req.query.udid : udid;
  if(udid != undefined){
    res.redirect(`${process.env.CLIENT_URL}/surveys/${udid}`)
  }
}

module.exports = app => {
  app.get('/mobile', redirect)
  app.get('/mobile-new/:udid',redirect)
}
