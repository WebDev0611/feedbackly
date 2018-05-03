var _ = require('lodash');
var flow = require('middleware-flow');
var fs = require('fs');
var path = require('path');

var questionTypes = require('app-modules/constants/question-types');
var errors = require('app-modules/errors');
var general = require('app-modules/middlewares/general');


var Organization = require('app-modules/models/organization');

var generateCustomCSS = require('./generate-custom-css').generateCustomCSS;

const imageCacheAsync = require('./image-cache-async');

var nop = () => () => {};

function getCommonState() {
  return flow.parallelWait(
    getClientDecorators(),
    getClientLanguage(),
    getClientPreviewStatus()
  );
}

function getInitialState() {
  return async (req, res, next) => {
    const now = Math.floor(+(new Date()) / 1000);

    var languages = req.survey.languages;
    var forcedLanguage = _.get(req, 'channel.force_default_language')

    var defaultLanguage =
    languages.indexOf(forcedLanguage) >= 0
      ? forcedLanguage
      : languages.indexOf(req.clientLanguage) >= 0
        ? req.clientLanguage
        : languages.indexOf('en') >= 0
          ? 'en'
          : languages[0];


    var customStyles =  _.get(req,'organization.custom_theme');

    req.initialState = {
      view: {
        decorators: req.clientDecorators,
        isPreview: req.clientPreviewStatus,
        latestInteraction: now,
        cssString: await generateCustomCSS(customStyles),
      },
      ping: {
        latestPing: null,
        refreshRequired: false,
        latestRefresh: now
      },
      language: defaultLanguage,
      defaultLanguage,
      activeCard: {
        transitioning: false,
        activeIndex: 0,
        cards: [...(req.survey.question_ids || []), { 
          end: true, displayProbability: 1 
        }]
      },
      organization: req.organization || {},
      channel: req.channel || {},
      survey: _.omit(req.survey, ['question_ids']) || {},
      build: req.clientBuild || '0'
    }
    return next();
  }
}

function getClientLanguage() {
  return (req, res, next) => {
    var defaultLanguage = req.query.language || req.get('Accept-Language') || 'en'

    req.clientLanguage = defaultLanguage.substr(0,2);

    return next();
  }
}

function getClientDecorators(getDecorators) {
  return (req, res, next) => {
    getDecorators = getDecorators || nop();

    var decorators = getDecorators(req) || req.query.decorators;

    if(decorators !== undefined) {
      req.clientDecorators = decorators.split(',').reduce((map, decorator) => {
        map[decorator.toUpperCase()] = true;

        return map;
      }, req.client.clientDecorators || {});
    } else {
      req.clientDecorators = {};
    }

    return next();
  }
}

function getClientImages() {
  return async (req, res, next) => {
    let images = [
      'https://survey.feedbackly.com/dist/images/logos/feedbackly-logo-rgb.png',
      'https://survey.feedbackly.com/dist/images/logos/feedbackly-logo-placeholder.png',
      'https://survey.feedbackly.com/dist/images/faces/placeholder.png',
      'https://survey.feedbackly.com/dist/images/faces/default/1a.png',
      'https://survey.feedbackly.com/dist/images/faces/default/2a.png',
      'https://survey.feedbackly.com/dist/images/faces/default/3a.png',
      'https://survey.feedbackly.com/dist/images/faces/default/4a.png',
      'https://survey.feedbackly.com/dist/images/faces/default/5a.png',
      'https://survey.feedbackly.com/dist/images/faces/plain/1b.png',
      'https://survey.feedbackly.com/dist/images/faces/plain/2b.png',
      'https://survey.feedbackly.com/dist/images/faces/plain/3b.png',
      'https://survey.feedbackly.com/dist/images/faces/plain/4b.png',
      'https://survey.feedbackly.com/dist/images/faces/plain/5b.png',
    ];

    if (_.get(req.organization, 'logo')) {
      images = [...images, req.organization.logo];
    }

    if(_.get(req.channel, 'logo')) {
      images = [...images, req.channel.logo];
    }

    (_.get(req.survey, 'question_ids') || []).forEach((question) => {
      if (question.question_type === questionTypes.Image) {
        images = [...images, ...question.choices.map(c => c.url)];
      }
    });


    if (req.clientDecorators && req.clientDecorators.IPAD === true) {
      if (req.query.images) {
        const imagesAlreadyOnIpad = req.query.images.split(',');
        images = images.filter(i => imagesAlreadyOnIpad.indexOf(i) === -1);
      }

      const promises = images.map(i => imageCacheAsync.fetch(i));
      const results = await Promise.all(promises);

      req.imageCache = {};
      results.forEach(i => req.imageCache[i.url] = i.data);
    }
    req.clientImages = images.filter(image => !!image);

    return next();
  };
}

function addClientDecorator(getDecorator) {
  return (req, res, next) => {
    var decorator = getDecorator(req);

    if(decorator !== undefined) {
      req.clientDecorators[decorator.toUpperCase()] = true;
    }

    return next();
  };
}

function getClientPreviewStatus() {
  return (req, res, next) => {
    req.clientPreviewStatus = req.query.preview === 'true'  ;

    return next();
  }
}

function setClientBuild(getBuild) {
  return (req, res, next) => {
    req.clientBuild = getBuild(req);

    return next();
  }
}

function setClientPreviewStatus(getPreviewStatus) {
  return (req, res, next) => {
    req.clientPreviewStatus = getPreviewStatus(req);

    return next();
  }
}


module.exports = { getInitialState, getCommonState, getClientLanguage, getClientDecorators, addClientDecorator, setClientPreviewStatus, getClientPreviewStatus, getClientImages, setClientBuild };
