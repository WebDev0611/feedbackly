const gulp = require('gulp');
const nodemon = require('gulp-nodemon');

const constants = require('./constants');

const server = () => {
  nodemon({
    script: 'server.js',
    ext: 'js',
    watch: constants.NODEMON_PATHS,
    env: {
      NODE_ENV: 'development',
      CLIENT_URL: 'http://localhost:8000',
      MONGODB_URL: 'mongodb://localhost/feedbackly-test',
      OLD_MONGO_URL: 'mongodb://localhost/tapin-prod',
      CRYPTO_SECRET: 'jsNM34fS'
    }
  });
}

module.exports = server;
