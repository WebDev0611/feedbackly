const profanityFilter = require("./function").profanityFilter;

exports.profanityFilter = (req, res, next) => {
  if (profanityFilter(req.body)) req.body.filtered = true;
  next();
};
