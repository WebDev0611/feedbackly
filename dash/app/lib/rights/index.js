const Functions = require("./functions");
const Middlewares = require("./middlewares");

module.exports = Object.assign(
  {},
  { getEverything: Functions.getEverything, cacheBust: Functions.cacheBust },
  Middlewares
);
