'use strict';

var Promise = require('bluebird');
var async = require('async');
var objectId = require('bson-objectid');
var _ = require('lodash');
var moment = require('moment');

var Fbevent = require('../../models/fbevent');
var Survey = require('../../models/survey');
var Device = require('../../models/device');
var Dailydevicefeedback = require('../../models/device/dailydevicefeedback');
var Devicefeedback = require('../../models/device/devicefeedback');
var Questionfeedback = require('../../models/question/questionfeedback');
var Surveyfeedback = require('../../models/survey/surveyfeedback');

var languageFeedbacks =  {
  fi: {
    opens: [
            "Kiitos reippaasta ja kärsivällisestä neuvonnasta :D",
            "En saanut palvelua. Ulkopuolinen henkilö tuli auttamaan... Jos teiltä ostan on se tämän henkilön ansiota.",
            "Tanja on paras! Aina ystävällinen ja auttavainen.",
            "Palvelut toimivat hyvin ja asiallisesti, ja jos tarvii apua niin aina voi kysyä. Suuret kiitokset",
            "Todella törkeää käytöstä teidän työntekijöiltä. Tosi koppavaa käytöstä. Niin ylvästä touhua. Tulee ketutus kun täältä lähtee takasin kotiin päin… turha odottaa minua enää tänne!!",
            "Sekavaa kun ei nää vuoronumeroita ei tiedä kuka menee milloinkin …",
            "Hyvää palvelua sain, kiitos!!",
            "Kiitos palvelusta!!! T soili hänninen",
            "Palloteltiin ympäriinä ja kukaan ei muka ehtinyt auttamaan, mistä hyvästä teillä sitten oikeen palkkaa maksetaan!?",
            "Ei löytynyt tuotteita, joita olisin halunnut, mutta ystävällisesti kerrottiin mistä niitä voisi saada. Hyvä, tulen jatkossakin ensin tänne!",
            "mahtavaa! :)",
            "Nuorehko vaalea nainen oli ystävällinen :-)",
            "miksi mainoksissa on eri hinnat kuin paikan päällä??",
            "ulko-oven aukioloajat on vieläkin päivittämättä...",
            "Sisäänkäynnin ympäristö on tosi sotkuinen.",
            "silloin ku palvelua tarvisi niin kukaan ei oo paikalla",
            "tosi kiva nuori nainen oli asiantunteva",
            "jee! tuun uudestaankin! T: sami"
        ]
  },
  en: {
    opens: [
            "Excellent service!!!",
            "I absolutely love the product range here :) Br, John",
            "All the products are way too expensive in your cafe... :S",
            "Aren't there any toilets here?! I didn't find them!",
            "Service is always friendly and helpful <3",
            "Blond girl at the cashier was very nice but I think she overcharged us",
            "Love ya!",
            "It's a bit dirty at the entrance and some of the light bulbs were broken.",
            "Lights werent working at the entrance...",
            "I didn't even get a smile from the cashier let alone a greeting",
            "Nice!",
            "Ill come again",
            "I couldn't find the oven mitts anywhere",
            "Awesome job guys"
    ]
},
sv: {
    opens: [
        "Alltid så hemskt smutsigt här men servicen är mycket vänligt...",
        "Varför har ni gömt toaletten??! det är nästan omöjligt att hitta den :/",
        "Jag älskar alla fina och intressanta saker som det finns här :) T: Jessica",
        "Annors bra men lite för dyrt",
        "Nån borde städa här... det är smutsigare här än ute",
        "Utmärktt!!!",
        "Barn som skriker hela tiden är irriterande",
        "Kassören var vacker och vänlig... Jag måste komma här oftare.",
        "Vad fint!",
        "Lampen vid ingången är sönder och måste fixas.",
        "Gillade absolut ingenting här. Allting var tråkigt.",
        "Mycket bra service!",
        "Mannen på kassan var elak och dryg",
        "Allt för mörkt vid ingången. Jag tror att lampen borde fixas där. det är ganska farligt nu när man kan inte se trapporna där.",
        "Allting bra",
        "Toiletten var svårt att hitta",
        "I cafeet finns det inga glutenfri bakelse",
        "öppettider på nätet är felaktiga!",
        "Mera parkeringsplatser för kunder."
    ]
  }
}

function generateCounter(fbevent, options) {
  var counter = { feedbackCount: options.isFirstInChain ? 1 : 0, fbeventCount: 1, numCount: 0, numSum: 0, deviceId: fbevent.device_id, surveyId: fbevent.survey_id, questionId: fbevent.question_id, date: moment.utc(fbevent.created_at_adjusted_ts * 1000).startOf('day').unix(), hour: moment.utc(fbevent.created_at_adjusted_ts * 1000).hours() };

  switch(fbevent.question_type) {
    case 'Button':
    case 'NPS':
      counter = Object.assign({}, counter, { numCount: 1, numSum: fbevent.data[0] });
      break;
    case 'Slider':
      counter = Object.assign({}, counter, { numCount: 1, numSum: fbevent.data.reduce((sum, slider) => sum + slider.data, 0) / fbevent.data.length });
      break;
  }

  return counter;
}

function generateFbevent(fbevent, options) {
  var data = [];

  var NPS_VALUES = _.range(0, 11).map(val => val / 10);
  var BUTTON_VALUES = _.get(options.question, 'opts.buttonCount') === 4
    ? [..._.range(0, 99, 33), 100].map(val => val / 100)
    : _.range(0, 125, 25).map(val => val / 100);

  var languagesInQuestion = _.keys(options.question.heading);

  switch(fbevent.question_type) {
    case 'Button':
      var buttonValue = _.sample(BUTTON_VALUES);

      data = [buttonValue];
      break;
    case 'NPS':
      var npsValue = _.sample(NPS_VALUES);

      data = [npsValue];
      break;
    case 'Text':
      var opens = _.get(languageFeedbacks, `${_.sample(languagesInQuestion)}.opens`) || languageFeedbacks.en.opens;

      data = [_.sample(opens)];
      break;
    case 'Word':
    case 'Image':
      data = [(_.sample(options.question.choices || []) || {}).id]
      break;
    case 'Slider':
      data = (options.question.choices || []).map(slider => {
        return { id: slider.id, data: parseFloat(Math.random().toFixed(1)) };
      });

      break;
  }

  return Object.assign({}, fbevent, { data, created_at: moment.utc(fbevent.created_at_adjusted_ts * 1000).toDate() });
}

function generateFeedbacks(options) {
  var queue = async.queue((task, callback) => {
    task(() => callback());
  }, 20);

  _.times(options.count, () => {
    var feedbackId = objectId().toHexString();

    var fbevents = options.questions.map((question, questionIndex) => {
      var question = options.questions[questionIndex];
      var deviceId = _.sample(options.deviceIds);
      var created = moment.utc((moment.utc().unix() - Math.floor(Math.random() * 60 * 60 * 24 * 30)) * 1000).set('hour', _.random(8, 20)).unix();

      return generateFbevent({
        question_type: question.question_type,
        device_id: deviceId.toString(),
        organization_id: options.organizationId,
        survey_id: options.surveyId,
        question_id: question._id,
        feedback_id: feedbackId,
        created_at_adjusted_ts: created
      }, { question });
    });

    fbevents = fbevents.map(fbevent => Object.assign({}, fbevent, { chain_started_at: fbevents[0].created_at_adjusted_ts }));

    var counters = fbevents.map((fbevent, fbeventIndex) => generateCounter(fbevent, { isFirstInChain: fbeventIndex === 0 }));

    var feedbacksObject = fbevents.reduce((map, fbevent) => {
      map[fbevent.question_id.toString()] = fbevent.data;

      return map;
    }, {});

    queue.push(callback => {
      return Promise.all([
        Promise.all(fbevents.map(fe => {
          return fe.data.length > 0
            ? Fbevent.create(Object.assign({}, fe, { feedbacks: feedbacksObject }))
            : Promise.resolve();
        })),
        Promise.all(counters.map(counter => {
          return Promise.all([
            Dailydevicefeedback.increase(counter),
            Devicefeedback.increase(counter),
            Surveyfeedback.increase(counter),
            Questionfeedback.increase(counter)
          ]);
        }))
      ]).then(() => callback());
    });
  });

  return new Promise((resolve, reject) => {
    queue.drain = () => {
      resolve();
    };
  });
}

function generate(options) {
  return Promise.all([
    Survey.findOne({ _id: options.surveyId })
      .populate('question_ids')
      .exec(),
    Device.find({ organization_id: options.organizationId }, { _id: 1 })
  ]).spread((survey, devices) => {
    if(!survey) {
      return Promise.reject(new Error(`No survey found with id ${options.surveyId}`));
    } else if(devices.length === 0) {
      return Promise.reject(new Error(`No devices found for organization with id ${options.organizationId}`));
    } else {
      var deviceIds = devices.map(device => device._id);

      return generateFeedbacks({
        deviceIds,
        questions: survey.question_ids,
        count: options.count,
        organizationId: options.organizationId,
        surveyId: options.surveyId
      });
    }
  });
}

module.exports = { generate };
