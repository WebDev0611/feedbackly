var Fbevent = require('../../models/fbevent');
var Organization = require('../../models/organization');
var Device = require('../../models/device');
var mongoose = require('mongoose');
var castTo = mongoose.Types;
var _ = require('lodash');
var auth = require('../../lib/auth');
var ROOT_PATH = '/api/reports';
var kesko = ["5613c16078c2bdff629c33fe","56deb1b1ab70e3acb0803fe9","558d040cf35fca099822f36e","559102faf35fca099822f3bb","560e9aa512ccd0e500b5bcaf","561ba89f78c2bdff629c3490","5739da94ac291ee900310eea","5519aa60bf011900006e9330", "58aff155dfb267000e19a4b1"];

module.exports = function(app){
  app.use(ROOT_PATH + '/*', auth.isLoggedInAndAdmin());

  app.get(`${ROOT_PATH}/yearly`, (req, res) =>{

    var orgs = req.query.orgs || [];
    if(req.query.kesko=="true") orgs = kesko;
    orgs = _.map(orgs, o => {return castTo.ObjectId(o)})

    var year = req.query.year || "2016";
    var dateFrom = new Date(year + "-01-01");
    var dateTo = new Date((parseInt(year)+1) + "-01-01"); // TODO: TIMEZONES

    var FeedbackPipeline = [
      {$match: {organization_id: {$in: orgs}, created_at: {$gt: dateFrom, $lt: dateTo}}},
      {$group: {
          _id: {fbid: "$feedback_id", organization_id: "$organization_id",month: {$month: "$created_at"}, count: {$sum: 1}}
      }},
      {
        $group: {
          _id: {month: "$_id.month", organization_id: "$_id.organization_id"},
          count: {$sum: "$_id.count"}
        }
      }
    ];

    var FbeventPipeline = [
      {$match: {organization_id: {$in: orgs}, created_at: {$gt: dateFrom, $lt: dateTo}}},
      {$group: {
          _id: {_id: "$_id", organization_id: "$organization_id", month: {$month: "$created_at"}}
      }},
      {
        $group: {
          _id: {month: "$_id.month", organization_id: "$_id.organization_id"},
          count: {$sum: 1}
        }
      }
    ];

    var TextFbeventPipeline = [
      {$match: {organization_id: {$in: orgs}, question_type: "Text", data: {$ne: []},created_at: {$gt: dateFrom, $lt: dateTo}}},
      {$group: {
          _id: {_id: "$_id", organization_id: "$organization_id", month: {$month: "$created_at"}}
      }},
      {
        $group: {
          _id: {month: "$_id.month", organization_id: "$_id.organization_id"},
          count: {$sum: 1}
        }
      }
    ];

    var p1 = Organization.find({_id: {$in: orgs}}).select({name: 1}).sort({_id: 1}).exec()
    var p2 = Device.find({organization_id: {$in: orgs}}).select({name: 1, organization_id: 1}).exec()

    var a1 = Fbevent.aggregate(FeedbackPipeline);
    var a2 = Fbevent.aggregate(FbeventPipeline);
    var a3 = Fbevent.aggregate(TextFbeventPipeline);

    a1.options = { allowDiskUse: true };
    a2.options = { allowDiskUse: true };
    a3.options = { allowDiskUse: true };

    a1.exec((err, feedbacks) => {
        if(err) return res.sendStatus(500);
    a2.exec((err, fbevents) => {
        if(err) return res.sendStatus(500);
    a3.exec((err, textFbevents) => {
        if(err) return res.sendStatus(500);

        Promise.all([p1, p2])
        .then((organizationsAndDevices) => {
            var organizations = organizationsAndDevices[0]
            var rows = {orgs: organizations, rows: []};
            for(var i=1; i<=12; i++){
              var row = {month: i, stats: []}
              _.forEach(organizations, o => {
                var orgStat = {id: o._id};
                var fbs = _.find(feedbacks, {_id: {month: i, organization_id: o._id}});
                var fbes = _.find(fbevents, {_id: {month: i, organization_id: o._id}});
                var text = _.find(textFbevents, {_id: {month: i, organization_id: o._id}});

                orgStat.feedbacks = fbs ? fbs.count : 0;
                orgStat.fbevents = fbes ? fbes.count : 0;
                orgStat.textFbevents = text ? text.count : 0;

                row.stats.push(orgStat);
              })
              rows.rows.push(row);
            }

            if(req.params.json) res.json(rows);
            else res.render('reports/yearly.ejs',{rows, _});


        }).catch(err => { throw err})


        })
      })
    })
  })

}
