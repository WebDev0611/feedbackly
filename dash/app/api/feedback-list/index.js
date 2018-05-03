var Feedback = require('../../models/feedback');
var ExcelWriter = require('node-excel-stream').ExcelWriter;
var csvWriter = require('csv-write-stream')
var _ = require('lodash')
var Device = require('../../models/device')
var Promise = require('bluebird')
var createHeaders = require('./create_headers')
var createFeedbackRow = require('./create_feedback_row').createRow
var cache = require('../../lib/cache')
var getFeedbackData = require('./pdf').getFeedbackData;
var moment = require('moment')
const FEATURES = require('../../lib/constants/features')

function createRequest(req, res){
  const request = req.body;
  const userId = req.user._id;
  const id = `${userId}-${Date.now()}`
  cache.set(id, JSON.stringify(request), { ttl: 30 });
  res.json({request: id})
}

function outputAsCsv(headers, row, res, csvWriterInstance){
  if(csvWriterInstance === undefined){
    res.setHeader('Content-Type','application/csv');
    res.setHeader( "Content-Disposition", "filename=feedback-list.csv");
    var csvHeaders = headers.map(h => h.key)
    _.remove(csvHeaders, c => c === '_id')
    csvWriterInstance = csvWriter({headers: csvHeaders, sendHeaders: false});
    csvWriterInstance.pipe(res);
    var displayHeaders = {}
    headers.map(h => { displayHeaders[h.key] = h.name})
    csvWriterInstance.write(displayHeaders)

  }

  csvWriterInstance.write(row)
  return csvWriterInstance;
}

async function excel(headers, rows, res){
  var excelHeaders = _.filter(headers, h => h.key !== '_id')
  let writer = new ExcelWriter({
      sheets: [{
          name: 'Sheet 1',
          key: 'feedbacks',
          headers: excelHeaders
      }]
  });

  let dataPromises = rows.map(row => {
    writer.addData('feedbacks', row)
  })

  await Promise.all(dataPromises)
  var excelStream = await writer.save();
  res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader( "Content-Disposition", "filename=excel.xlsx");
  excelStream.pipe(res);
}

async function outputAsPDF(headers, rows, userId, res){
  var data = {headers, rows /*, selection details */ }
  var url = `${process.env.DASH_SERVICE_URL}/api/v2/feedback-list-pdf/${userId}`
  cache.set(`feedback_list_print_payload_${userId}`, JSON.stringify(data), { ttl: 60 * 3 })
  res.render('feedback-list-pdf.ejs', {data, translate: str => str, getFeedbackData})
  // await request(`${process.env.PDF_SERVICE_URL}/?token=feedbackly&skipAmazon=true&address=${url}`)
}




async function get(req, res){
  var optsId = req.query.id
  var opts = await cache.get(optsId)
  var rightsToDevices = (_.get(req, 'userRights.devices') || []).map(d => d.toString())
  var deviceList = _.filter(opts.devices, d => rightsToDevices.indexOf(d.toString()) > -1)

  opts.to = moment.utc(opts.to).endOf('day').unix()
  opts.from =moment.utc(opts.from).startOf('day').unix()

  if(opts.format === 'csv' || opts.format === 'xlsx' || opts.format === 'pdf'){
    const features = _.get(req, 'userRights.availableFeatures') || [];
    if(features.indexOf(FEATURES.FILE_EXPORTS.ALL) === -1) return res.status(401).json({error: 'You have no rights to export files. Upgrade plan.'})
  }

  var [headers,devices] = await Promise.all([createHeaders.createHeaders(opts),Device.find({_id: {$in: deviceList }})])

  var query = {
    survey_id: {$in: opts.surveys},
    device_id: {$in: deviceList},
    created_at_adjusted_ts: {
      $lte: opts.to,
      $gte: opts.from
    }
  }

  var rows = []
  var htmlRows = []
  const originalQuery = {...query}
  
  const feedbackCountPromise = Feedback.count(originalQuery)
  
  const responseLimit = _.get(req, 'userRights.responseLimit');
  if(responseLimit){
    query = Object.assign(query, {period_sequence: {$lt: responseLimit}})
    var [feedbackCount, feedbackCountInPlan] = await Promise.all([feedbackCountPromise,Feedback.count(query)])
  } else {
    var feedbackCount = await feedbackCountPromise;
  }
  
  if(opts.skip && opts.limit) var stream = Feedback.find(query).sort({created_at_adjusted_ts: -1}).skip(parseInt(opts.skip)).limit(parseInt(opts.limit)).cursor()
  else if(opts.skip) var stream = Feedback.find(query).sort({created_at_adjusted_ts: -1}).skip(parseInt(opts.skip)).cursor()
  else if(opts.limit) var stream = Feedback.find(query).sort({created_at_adjusted_ts: -1}).limit(parseInt(opts.limit)).cursor()
  else var stream = Feedback.find(query).sort({created_at_adjusted_ts: -1}).cursor()
  var csvWriterInstance;


  stream.on('data', feedback => {
    stream.pause()
    var row = createFeedbackRow(feedback, headers, devices, opts.format);
    if(opts.format === 'csv') csvWriterInstance = outputAsCsv(headers, row, res, csvWriterInstance )
    rows.push(row)
    stream.resume()
  })


  stream.on('end', () => {
    if(opts.format === 'xlsx') excel(headers, rows, res)
    else if(opts.format == 'pdf') outputAsPDF(headers, rows, req.user._id, res)
    else if(opts.format == 'csv') csvWriterInstance.end()
    else res.send({headers, rows, feedbackCount, feedbackCountInPlan, planLimit: responseLimit})
  })
}


module.exports = {get, getPDF: () => {}, createRequest}
