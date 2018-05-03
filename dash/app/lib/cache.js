var redis = require('redis');
var Promise = require('bluebird');

var redisConfig = { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT };

if(process.env.REDIS_AUTH_PASS) {
  redisConfig.auth_pass = process.env.REDIS_AUTH_PASS;
}

var client = redis.createClient(redisConfig);

function set(key, value, options) {
  return new Promise((resolve, reject) => {
    client.set(key, value, function(err, status) {
      if(err) {
        reject(err);
      } else {
        resolve(status);
      }
    });

    if(options && options.ttl !== undefined) {
      client.expire(key, options.ttl);
    }
  });
}

function get(key) {
  return new Promise((resolve, reject) => {
    client.get(key, function(err, cached) {
      if(err) {
        reject(err);
      } else {
        resolve(cached ? JSON.parse(cached) : undefined);
      }
    });
  });
}

function del(key) {
  return new Promise((resolve, reject) => {
    client.del(key, (err, o) => {
      if(err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function middleware(keyGetter) {
  return function(req, res, next) {
    var cacheKey = keyGetter(req);

    if(!cacheKey || req.query.skip_cache) {
      return next();
    }

    client.get(cacheKey, function(err, cached) {
      if(err || !cached) {
        next();
      } else {
        res.json(JSON.parse(cached));
      }
    });
  }
}

function getClient() {
  return client;
}

module.exports = { get: get, set: set, middleware: middleware, getClient: getClient, del: del };
