var Basetranslation = require('../models/base-translation');
var auth = require('../lib/auth');
var _ = require('lodash')

module.exports = app =>{
  app.get('/api/base-translations/:lang',
    auth.isLoggedIn(),
    (req, res) => {

      Basetranslation.findOne({language: req.params.lang, $or: [{organization_id: req.user.activeOrganizationId()}, {admin_translation: true}]})
      .then(translation => {
        if(translation) res.send(translation);
        else res.send({translations: {}})
      })
      .catch(err => {
          console.log(err)
      })

    }
  );

  app.post('/api/base-translations',
    auth.isLoggedIn(),
    (req, res) => {
      var body = req.body;
      var payload = _.assign(req.body,{organization_id: req.user.activeOrganizationId()})

      Basetranslation.findOneAndUpdate({language: body.language, organization_id: req.user.activeOrganizationId()}, payload, {upsert: true})
      .then((e) => {
        console.log(e)
        res.sendStatus(201);
      })
      .catch(err => {
        console.log(err)
        res.send(err);
      })


    })
}
