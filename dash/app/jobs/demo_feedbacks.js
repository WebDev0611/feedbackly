/* DEMO FEEDBACK GENERATOR. IS MEANT TO BE INVOKED AT MIDNIGHT */

var Feedback = require('../models/feedback');
var Fbevent = require('../models/fbevent');
var Survey = require('../models/survey')
var _ = require('lodash');
var moment = require('moment');
var async = require('async');

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    return s4() + s4() + s4() + s4() +
        s4() + s4();
}

var options = function(){
    return {
        qty: _.random(30, 65),
        date: parseInt(moment.utc().format('x')), // 0:00 o'clock
        minTime: 7 * 60 * 60 * 1000,
        maxTime: 18 * 60 * 60 * 1000,
        button_values: [0, 0.33, 0.33, 0.66, 0.66, 0.66, 1, 1, 1, 1],
        nps_values: [0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1,0.5,0.6,0.7,0.8,0.9,1,0.8,0.9,1]

    }
}

var language_opts =  {
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
                ],
            words: ["Sanomalehti", "TV", "Radio", "Facebook", "Nettisivut", "Muu", "En ole nähnyt"]
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
            ],
            words: ["Newspaper", "TV", "Radio", "Facebook", "Website", "Other", "I haven't seen"]
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
            ],
            words: ["Tigningen","TV","Radio","Facebook","Webbsidan","Annat","Jag har inte sett"]
        }
}


module.exports = function (app) {

    app.get('/demogen', function (req, res) {
        if(req.query.auth == 's987'){
            var language = req.query.lang;
            var opts = options();

            if(req.query.date){
                opts.date = moment.utc(req.query.date).unix()*1000;
            }

            if(language == 'fi'){
                opts.survey_id = process.env.survey_id_fi
                opts.devices = [process.env.device1_fi, process.env.device2_fi, process.env.device3_fi]
            //   opts.devices = ["563884be4bb2f444050b6a28", "563884c34bb2f444050b6a29", "563884c74bb2f444050b6a2a"]
            } else if(language == 'en'){
                opts.survey_id = process.env.survey_id_en || "5638edd7ab4a80d302847dff"
                opts.devices = [process.env.device1_en, process.env.device2_en, process.env.device3_en]
             // opts.devices = ["563884cd4bb2f444050b6a2b", "563884d04bb2f444050b6a2c", "563884d44bb2f444050b6a2d"]
            } else if(language == 'sv'){
                opts.survey_id = process.env.survey_id_sv || "5638972d4bb2f444050b6a39"
                opts.devices = [process.env.device1_sv, process.env.device2_sv, process.env.device3_sv]
             // opts.devices = ["563884da4bb2f444050b6a2e", "563884df4bb2f444050b6a2f", "563884e24bb2f444050b6a30"]
            }  

            opts.orgid = process.env["organization_id_" + language] || "54296d60d4f9ef0000f14448"
            opts.words = language_opts[language].words 
            opts.opens = language_opts[language].opens

            Survey.findOne({_id: opts.survey_id}, function(err, survey){
                if(err) throw err;
                var question_ids = survey.question_ids;

            async.each(_.range(1,opts.qty), function(number, cb){

            var ts = opts.date + _.random(opts.minTime, opts.maxTime);
            var fbID = guid();
            var did = _.sample(opts.devices);
            var fb = new Feedback({
                _id: fbID,
                created_at: moment.utc(ts),
                device_id: did,
                survey_id: opts.survey_id,
                feedbackInternalId: guid(),
                organization_id: opts.orgid,
                fbevents: [],
                created_at_adjusted_ts: parseInt(ts / 1000)
            });


            var fbeTemplate = {
                "feedback_id": fbID,
                "internalId": "1432025319444",
                "device_id": did,
                "survey_id": opts.survey_id,
                "organization_id": opts.orgid,
                "created_at": moment.utc(ts),
                "created_at_adjusted_ts": parseInt(ts / 1000) // ihan sama
            }

            var fbe1 = new Fbevent(fbeTemplate);
            fbe1.data = [_.sample(opts.button_values)];
            fbe1.question_type = "Button";
            fbe1.question_id = question_ids[0];
            var fbe2 = new Fbevent(fbeTemplate);
            fbe2.data = [_.sample(opts.words)];
            fbe2.question_type = "Word";
            fbe2.question_id = question_ids[1];
            var fbe3 = new Fbevent(fbeTemplate);
            fbe3.data = [_.sample(opts.nps_values)];
            fbe3.question_type = "NPS";
            fbe3.question_id = question_ids[2];
            var fbe4 = new Fbevent(fbeTemplate);
            fbe4.data = [_.sample(opts.opens)];
            fbe4.question_type = "Text";
            fbe4.question_id = question_ids[3];

            async.series([
                function (callback) {
                    fbe1.save(function (err, doc) {
                        console.log(err)
                        console.log(doc);
                        callback(null, doc._id);
                    });
                },
                function (callback) {
                    fbe2.save(function (err, doc) {
                        console.log(doc);
                        callback(null, doc._id);
                    });
                },
                function (callback) {
                    fbe3.save(function (err, doc) {
                        console.log(doc);
                        callback(null, doc._id);
                    });
                },
                function (callback) {
                    fbe4.save(function (err, doc) {
                        console.log(doc);
                        callback(null, doc._id);
                    });
                }
            ], function (err, results) {
                fb.fbevents = results;
                fb.save(function (err, doc) {
                    console.log(err);
                    console.log(doc);
                    cb();
                })
            });

        }, function(err){
            console.log(err);
            res.send(200);
        });

     })       
    }
    });
};