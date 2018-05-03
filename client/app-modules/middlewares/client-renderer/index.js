var flow = require('middleware-flow');
var path = require('path');
var moment = require('moment')
var clientState = require('app-modules/middlewares/client-state');
var general = require('app-modules/middlewares/general');
var organizations = require('app-modules/middlewares/organizations');

const loadCounts = require('../../../lib/load_counts')

function renderClientWithMiddlewares(middlewares) {
  return flow.series(
    clientState.getCommonState(),
    clientState.addClientDecorator(req => req.query.view),
    flow.series.apply(this, middlewares),
    organizations.getOrganizationById(req => req.survey.organization),
    organizations.getOrganizationDecorators(req => req.organization),
    clientState.getClientImages(),
    clientState.getInitialState(),
    loadCounts.logSurveyView(),
    renderClient()
  )
}

function renderClient() {
  return (req, res, next) => {
    var cacheKey = moment.utc().startOf('minute').unix();

    var params = {
      initialState: req.initialState || {},
      images: req.clientImages || [],
      imageCache: req.imageCache || {},
      cacheKey,
      host:  'https://' + req.get('host'),
      parentHeight: req.query.h || "",
      parentWidth: req.query.w || ""
    }

    if(req.query.format==="json") return res.json({
      _IMAGE_SOURCES: params.images,
      _CACHE_KEY: params.cacheKey,
      _STATE_FROM_SERVER: params.initialState,
      EXTERNAL_HOST: params.host
    })

    if(req.query.format==="js") return res.contentType("text/javascript").send(`

      window._IMAGE_SOURCES = ${JSON.stringify(params.images)};
      window._CACHE_KEY = ${params.cacheKey};
      window._STATE_FROM_SERVER = ${JSON.stringify(params.initialState)};
      window.parentHeight = '${req.query.h}';
      window.parentWidth = '${req.query.w}';

      try{
        window._IMAGES_BASE64 = ${JSON.stringify(params.imageCache)}

        Object.keys(window.CACHE_FROM_IPAD || []).forEach(function(key){
          window._IMAGES_BASE64[key] = window.CACHE_FROM_IPAD[key];
        })      

      
         window.webkit.messageHandlers.callbackHandler.postMessage(JSON.stringify({saveImageCache: JSON.stringify(window._IMAGES_BASE64)}))
      }catch(e){}

      localStorage.setItem("_IMAGE_SOURCES", JSON.stringify(window._IMAGE_SOURCES))
      localStorage.setItem("_CACHE_KEY", window._CACHE_KEY)
      localStorage.setItem("_STATE_FROM_SERVER_NEW_SCHEMA", JSON.stringify(window._STATE_FROM_SERVER))
      localStorage.setItem("parentHeight", window.parentHeight);
      localStorage.setItem("parentWidth", window.parentWidth);

      window.ASSET_VERSION = ${process.env.buildVersion}; 
    `);


    return res.render(path.resolve('./views/react-client.ejs'), params);
  }
}

module.exports = { renderClientWithMiddlewares }
