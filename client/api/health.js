var mongoose = require('mongoose')

module.exports = function(app) {

  app.get('/health', function(req, res){
    var mongoConnected = mongoose.connection.readyState === 1;
    if(mongoConnected) res.status(200).send({status: 'ok'})
    else process.exit(1)
  })
}
