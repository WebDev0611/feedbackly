var mongoose = require('mongoose');
var _ = require('lodash');
var moment = require('moment');
var mailer = require('../../lib/mailer');
var ObjectID = require('mongodb').ObjectID;
var fs = require('fs');
var enc = require('../../lib/encryption');
var unsubscribe = require('./unsubscribe');


const EMAIL_ORG_CUTOFF = moment.duration(7, 'days');
const EMAIL_GLOBAL_CUTOFF = moment.duration(1, 'days');

const MARKETING_FROM_ADDRESS = 'noreply@feedbackly.com';
const MARKETING_FROM_NAME = ' via Feedbackly';

const MARKETING_UNSUBSCRIBE_URL = process.env.API_URL + '/unsubscribe?id=%UNSUBSCRIBE_ID%';


function constructQuery(organization_id, filter = {}) {
  var query = {
    organization_id: ObjectID(organization_id)
  };
  if (filter.device_id) query.device_id = ObjectID(filter.device_id);
  if (filter.survey_id) query.survey_id = ObjectID(filter.survey_id);
  var ts_range = {};
  if (filter.ts_after) ts_range['$gt'] = new Date(filter.ts_after);
  if (filter.ts_before) ts_range['$lt'] = new Date(filter.ts_before);
  if (!_.isEmpty(ts_range)) query.created_at = ts_range;

  if (filter.include_languages && filter.include_languages.length) {
    query.language = {$in: filter.include_languages};
  } else if(filter.exclude_languages && filter.exclude_languages.length) {
    query.language = {$nin: filter.exclude_languages};
  }

  return query;
}

async function countFilter(req, res) {
  var query = constructQuery(req.body.organization_id, req.body.filter);
  var result = await mongoose.connection.db.collection('marketing_contacts').aggregate([
    { $match: query},
    { $group: { _id: "$email"}  },
    { $group: { _id: 1, count: { $sum: 1 } } }
  ]).toArray();
  var count = result.length ? result[0].count : 0;
  res.send({
    count
  });

  // TODO: remove debug prints
    var contacts = await mongoose.connection.db.collection('marketing_contacts').find(query).toArray();
    var emails = _.chain(contacts).map(e => enc.decrypt(e.email)).uniq().value();
    console.log(emails);
}

function encodeAttachment(file) {
  return new Promise((res, rej) => {
    fs.readFile(file, function(err, data) {
      if (err) return rej(err);
      var base64data = new Buffer(data).toString('base64');
      res(base64data);
    });
  });
}

function mailLogPromise(entries) {
  return new Promise((res, rej) => {
    mongoose.connection.db.collection('marketing_email_log')
      .insert(entries, (err, docs) => err ? rej(err) : res());
  });
}

/*
 * Get all emails for a marketing group that haven't received an email recently or haven't unsubscribed
 * Returns { email: [String], emailMap: [String -> {email details}]}
*/
async function getEmailsForGroup(group) {
  var query = constructQuery(group.organization_id, group.filter);
  var contacts = await mongoose.connection.db.collection('marketing_contacts').find(query).toArray();
  var emailMap = _.keyBy(contacts, 'email');
  _.forEach(emailMap, (val, key) => emailMap[key] = _.merge({}, val, {
    email: enc.decrypt(val.email)
  }));
  var contact_emails = _.uniq(_.map(contacts, c => c.email));
  var recent_emails = _.keyBy(
    await mongoose.connection.db.collection('marketing_email_log')
    .find({
      email: { $in: contact_emails },
      $or: [{
              created_at: { $gt: moment().subtract(EMAIL_GLOBAL_CUTOFF).toDate() }
            },
            {
              $and: [
                { created_at: { $gt: moment().subtract(EMAIL_ORG_CUTOFF).toDate() } },
                { organization_id: ObjectID(group.organization_id)}
              ]
          }]
    }).toArray(), 'email');

  var unsubscribes = _.keyBy(
    await mongoose.connection.db.collection('marketing_unsubscribes').find({
      email: { $in: contact_emails }
    }).toArray(), 'email' );

  var to_emails = _.filter(contact_emails, email => !(email in recent_emails) &&
    !(email in unsubscribes && (unsubscribes[email].unsubscribeAll || unsubscribes[email].orgs.includes(group.organization_id.toString()))));

  console.log(`Sending emails to ${to_emails.length}/${contact_emails.length} addresses`);
  return { emails: to_emails, emailMap }
}

/*
 * Takes in attributes from the incoming mail and returns a function (email: Array) -> emailObject
*/
async function constructEmail(body, files, emailMap) {

  var content = [];
  if ('text' in body) content.push({
    type: 'text/plain',
    value: body.text + '\n\nTo unsubscribe, go to ' + MARKETING_UNSUBSCRIBE_URL
  });
  if ('html' in body) content.push({
    type: 'text/html',
    value: body.html + `<br/><br/>To unsubscribe, click <a href='${MARKETING_UNSUBSCRIBE_URL}'>here</a>`
  });

  var attachmentCount = parseInt(body.attachments);
  var attachments = [];

  if (attachmentCount) {
    var attachmentMap = JSON.parse(body['attachment-info']);
    var files = _.keyBy(files, 'fieldname');
    for (var i = 1; i <= attachmentCount; i++) {
      var t = attachmentMap['attachment' + i];
      var obj = {
        filename: t.filename,
        name: t.name,
        type: t.type,
        content_id: t['content-id'],
        //SendGrid inbound api does not have a field for inline attachments?
        disposition: (body.html || '').includes(t['content-id']) ?
          'inline' : 'attachment',
        content: await encodeAttachment(files['attachment' + i].path)
      };
      attachments.push(obj);
    }
  }
  var emailFunction = (emails) => {
    var o = {
      subject: body.subject,
      from: {
        email: MARKETING_FROM_ADDRESS,
        name: body.from.split(" <")[0] + MARKETING_FROM_NAME
      },
      personalizations: emails.map((e,index) => ({
        to: [{
          email: emailMap[e].email
        }],
        substitutions: {
          '%UNSUBSCRIBE_ID%': emailMap[e]._id.toString()
        }
      })),
      content
    };
    if (attachments.length) o.attachments = attachments;
    return o;
  };
  return emailFunction;
}

async function emailWebhook(req, res) {
  try {
    var alias = req.body.to.split('@')[0];
    var group = await mongoose.connection.db.collection('marketing_groups').findOne({
      alias
    });
    if (!group) {
      console.error(`Couldn't find alias ${alias}`);
      res.sendStatus(200);
      return;
    }
    var {emails, emailMap} = await getEmailsForGroup(group);
    var email_chunks = _.chunk(emails, 100);
    var emailFunction = await constructEmail(req.body,req.files,emailMap);

    var dbPromises = [];
    for (var chunk of email_chunks) {
      var result = await mailer.sendMail(emailFunction(chunk));
      dbPromises.push(mailLogPromise(chunk.map(email => ({
        email,
        created_at: new Date(),
        organization_id: ObjectID(group.organization_id),
        marketing_group_id: ObjectID(group._id)
      }))))
    }
    dbPromises.push(mongoose.connection.db.collection('marketing_group_log').insert({
      contents: req.body,
      created_at: new Date(),
      organization_id: ObjectID(group.organization_id),
      marketing_group_id: ObjectID(group._id),
      target_size: _.keys(emailMap).length,
      sent_count: emails.length
    }).then(a => {
      return mongoose.connection.db.collection('marketing_groups')
        .update({
          _id: ObjectID(group._id)
        }, {
          $push: {
            sent_ids: ObjectID(a._id)
          },
          $set: {
            last_sent: new Date()
          }
        })
    }));

    await Promise.all(dbPromises);

    res.sendStatus(200);
  } catch (err) {
    console.error('fail', err);
    res.sendStatus(200);
  }
}

module.exports = {
  countFilter,
  emailWebhook,
  unsubscribe
};
