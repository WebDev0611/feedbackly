var path = require('path');
var appDir = path.dirname(require.main.filename);

process.env.SENDGRID_TEMPLATE_ID = process.env.SENDGRID_TEMPLATE_ID ? process.env.SENDGRID_TEMPLATE_ID : '07f75865-cf93-438a-bbfd-e82d3fdf3233'

if(process.env.DOCKER_ENV=='production'){
  require('dotenv').config({path: path.join(appDir, "./.env/shared.prod")});
}

if(process.env.DOCKER_ENV=='kontena'){
  require('dotenv').config({path: path.join(appDir, "./.env/kontena.env")});
}
