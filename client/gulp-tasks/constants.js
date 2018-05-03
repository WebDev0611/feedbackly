const path = require('path');

const constants = {
  TRANSLATION_FILE_PATHS: [path.resolve('./translations/*.yml')],
  TRANSLATION_DEST_PATH: path.resolve('./app-modules'),
  NODEMON_PATHS: [path.resolve('./api'), path.resolve('./app-modules')]
}

module.exports = constants;
