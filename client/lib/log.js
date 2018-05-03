const TIMEOUT = 30000;

const winston = require('winston');
const logger = new winston.Logger({
    transports: [
      new (winston.transports.Console)()
    ]
});


function requestLogger(){
  return function(req, res, next){
    var startTime = Date.now()
    var url = req.url;
    var method = req.method;

    var timeout = setTimeout(() => {
      logger.warn(`SLOW REQUEST: ${method} ${url} ${req.requestId}`)
    }, TIMEOUT)

    req.requestId = startTime + Math.random().toString(36).substring(4);

    next()

    res.on('finish',() => {
      clearTimeout(timeout)
      var responseTime = Date.now() - startTime;
      var status = res.statusCode;
      logger.info(`${status} ${method} ${url} ${responseTime}ms ${req.requestId}`)
      if(method == 'POST'){
        logger.info(`body: ${JSON.stringify(req.body)} ${req.requestId}`)
      }
    })
  }
}

function getLogger(){
  return logger;
}

module.exports = {getLogger, requestLogger}
