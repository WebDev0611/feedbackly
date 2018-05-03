var flow = require('middleware-flow');
var _ = require('lodash')
var mongoose = require('mongoose')
var oid = mongoose.Types.ObjectId
var moment = require('moment');
const minify = require('minify');
const Device = require('app-modules/models/device');
const loadCounts = require('../lib/load_counts')

module.exports = app => {

  app.get('/plugin/:udid/script.js',
    (req,res) => {
        var udid = req.params.udid;
        minify(process.cwd() + '/plugin-v2/script_tag.js', (error, data) => {
            if (error) { console.error(error.message); return res.send(''); }

            data = data.split("process.env.CLIENT_URL").join(`"${process.env.CLIENT_URL}"`)
            if(!req.query.noinit) data+=`var _FblyPlugin=new Fbly("${req.params.udid}");`
            res
            .header('Content-Type', 'application/javascript')
            .send(data)
        });
    }
  );


  app.get('/plugin/:udid_or_id/settings.js',
    async (req,res) =>  {
      try{

        var defaultSettings = {
          "urlPatterns" : {"rules" : [],"mode" : "single"},
            "exitTrigger" : false,
            "afterPercentage" : 0,
            "hiddenAfterFeedbackForHours" : 24,
            "hiddenAfterClosedForHours" : 24,
            "showAfterVisitedPages" : 0,
            "showAfterSecondsOnSite" : 0,
            "showAfterSecondsOnPage" : 0,
            "display" : "popup",
            "placement" : "bottom-right",
            "sampleRatio": 1
        }
        var query = {$or: [{udid: req.params.udid_or_id}]}
        try{ query.$or.push({_id: oid(req.params.udid_or_id)}) } catch(e){}
        var device = await Device.findOne(query);
        if(!device) return res.sendStatus(404);
        var settings = Object.assign({},defaultSettings, (_.get(device, 'settings.pluginSettings') || {}))
        settings.udid = device.udid;
        if(settings.disabled) res.header('Content-Type', 'application/javascript').send('');
        const sessionId = req.cookies._fbly_sesid || Date.now() + "" + Math.round((Math.random()*1000));
        res.cookie('_fbly_sesid', sessionId, { maxAge: 900000, httpOnly: true });
        loadCounts.logPageView(device, sessionId);

        var cb = req.query.callback;
        res.header('Content-Type', 'application/javascript').send(`${cb}(${JSON.stringify(settings)})`)
      }catch(e){
        console.error(e)
        res.sendStatus(500);
      }
  });

  app.get('/plugin', (req, res) => {
    if(process.env.NODE_ENV !== 'kontena' && process.env.NODE_ENV !== 'production' ) {
      res.render('plugin');
      } else {
      res.sendStatus(404);
    }
  });
}
