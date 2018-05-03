var auth = require('../lib/auth');
var validator = require('../lib/request-validator');
var languageConstants = require('../lib/constants/language');
var cache = require('../lib/cache');
var Promise = require('bluebird');
var path = require('path');
var _ = require('lodash');
var fs = require('fs');
var translations = require('../lib/translations');
var render = require('../lib/render');
var request = Promise.promisify(require("request"));
Promise.promisifyAll(request);

function generatePDF(userId, options){

  var url = process.env.DASH_SERVICE_URL + '/api/print-results/' + userId + '?language=' + options.language
  var pdfServiceUrl = process.env.PDF_SERVICE_URL || 'http://localhost:8001'

  return request(`${pdfServiceUrl}/?token=feedbackly&address=${url}`)
  .then((a) => {

    return a.body
  })
}


function generatePDFF(userId, options) {
  return phridge.spawn({
    "--ssl-protocol": "any",
    "--ignore-ssl-errors": "true"
  })
    .then(function(phantom)  {
      return phantom.openPage(process.env.DASH_URL + '/api/print-results/' + userId + '?language=' + options.language);
    })
    .then(function(page)  {
      return page.run(userId, function(userId, resolve) {
        this.viewportSize = { width: 1920, height: 1080 };

        this.paperSize = {
          format: 'A4',
          orientation: 'portrait',
          margin: '1cm'
        };

        var pg = this;

        setTimeout(function(){
            var url = 'exports/' + userId + '-results.pdf';

            pg.render(url, { format: 'pdf', quality: '100' });

            resolve('/api/print-results/' + userId + '/pdf');
        }, 500);
      });
    })
    .finally(phridge.disposeAll);
}

module.exports = app => {
  app.post('/api/print-results',
    auth.isLoggedIn(),
    validator.bodyRequirements(['payload']),
    (req, res) => {
      cache.set(`results_print_payload_${req.user._id}`, JSON.stringify(req.body.payload), { ttl: 60 * 3 })
        .then(() => {
          generatePDF(req.user._id, { language: req.query.language || _.get(req.user, 'settings.locale') || 'en' })
            .done(url => res.json({ url }), err => render.error(req, res, {err}));
        })
        .catch(err => render.error(req, res, { err }));
    });

  app.get('/api/print-results/:id',
    (req, res) => {
      var translationPromise;
      var language = req.query.language;

      translations.getTranslations(language)
        .then(gt => {
          cache.get(`results_print_payload_${req.params.id}`)
            .then(payload => {
              if(!payload) {
                return res.sendStatus(404);
              } else {
                res.render('print-results/index.ejs', { payload, _, language, gt });
              }
            });
        });
    });

  app.get('/api/print-results/:id/pdf',
    auth.isLoggedIn(),
    auth.isCurrentUser(req => req.params.id),
    (req, res) => {
      var filePath = path.join(__dirname, '../../exports', `${req.params.id}-results.pdf`);

      res.set({
        'Content-Type': 'application/pdf'
      });

      res.download(filePath, `results-${_.now()}.pdf`, err => {
        if(!err) {
          fs.unlink(filePath);
        }
      });
    });
}
