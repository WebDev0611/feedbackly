var intercom = require('../lib/intercom');

module.exports = app => {
  app.get('/intercom',
    intercom.eventMiddleware({
      eventName: req => req.query.event,
      userId: req => req.query.user_id,
      meta: req => {
        if(req.query.redirect !== undefined) {
          return { url: decodeURIComponent(req.query.redirect) };
        } else {
          return {};
        }
      }
    }),
    (req, res) => {
      var dashUrl = process.env.DASH_URL;

      if(req.query.redirect !== undefined) {
        res.redirect(decodeURIComponent(req.query.redirect));
      } else {
        res.redirect(dashUrl);
      }
    });
}
