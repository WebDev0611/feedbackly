var auth = require("../lib/auth");
var CompletedHint = require("../models/completedhint");

module.exports = app => {
  app.post(
    "/api/completed_hints/:hintId/complete",
    auth.isLoggedIn(),
    (req, res) => {
      CompletedHint.setAsCompleted({
        userId: req.user._id,
        hintId: req.params.hintId
      }).then(() => res.json({ hintId: req.params.hintId }));
    }
  );
};
