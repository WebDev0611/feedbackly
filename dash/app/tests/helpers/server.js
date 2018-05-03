var app = require('../../../server');

function start() {
  app.initialize();
  app.start();
}

function stop() {
  app.stop();
}

module.exports = { start, stop };
