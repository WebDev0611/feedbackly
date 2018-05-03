var path = require('path');
var appDir = path.dirname(require.main.filename);

if(process.env.DOCKER_ENV=='production'){
  require('dotenv').config({path: path.join(appDir, "./.env/shared.prod")});
}

if(process.env.DOCKER_ENV=='kontena'){
  require('dotenv').config({path: path.join(appDir, "./.env/kontena.env")});
}
