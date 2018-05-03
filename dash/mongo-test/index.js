const MongodbMemoryServer = require("mongodb-memory-server").MongoMemoryServer;
const opts = { useMongoClient: true };

function before(done, dbPath, dbName, mongoose, debug = false) {
  const mongoServer = new MongodbMemoryServer({
    instance: {
      dbPath, // by default create in temp directory
      dbName,
      storageEngine: "wiredTiger", // by default `ephemeralForTest`
      debug // by default false
    },
    debug // by default false
  });
  mongoServer.getConnectionString().then(mongoUri => {
    mongoose.connect(mongoUri, opts, err => {
      done(err);
    });
  });

  return mongoServer;
}

function after(mongoose, mongoServer) {
  return function() {
    mongoose.disconnect();
    mongoServer.stop();
  };
}

module.exports = { before, after };
