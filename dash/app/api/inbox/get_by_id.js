const oid = require("mongoose").Types.ObjectId;
const _ = require("lodash");
const Feedback = require("../../models/feedback");
const utils = require("./utils");
const Message = require("../../models/message");

const makeEvents = require("./make_events").makeEvents;

const FEATURES = require('../../lib/constants/features');

async function getById(req, res) {
  if((_.get(req, 'userRights.availableFeatures') || []).indexOf(FEATURES.FEEDBACK_INBOX) === -1) return res.status(401).json({error: "No access to Feedback Inbox. Please upgrade your plan."})

  let _id;
  try {
    _id = oid(req.params.id);
  } catch (e) {
    return res.status(400).json({ error: "id format incorrect" });
  }
  try {
    const organization_id = req.user.activeOrganizationId();
    const devices = _.get(req, "userRights.devices");
    const inboxSettings = _.get(req, "userRights.inbox_settings") || {};
    const inboxMode = inboxSettings.mode || "all";
    const hideFullProfiles = inboxSettings.hide_full_profiles;
    const userGroups = inboxSettings.user_groups;
    const language = _.get(req, "user.settings.locale") || "en";

    const query = { _id, device_id: {$in: devices}, organization_id };

    if (inboxMode == "group_assigned" && userGroups) {
      query.processedByGroup = {
        $elemMatch: { group_id: { $in: userGroups.map(g => oid(g)) } }
      };
    }

    const feedback = await Feedback.findOne(query);
    if (!feedback) return res.status(404).json({ error: "No feedback found" });

    const otherFeedback = await utils.getOtherFeedbackBasedOnContactInfo(
      feedback.contact,
      inboxSettings,
      devices
    );
    const allFeedback = [feedback, ...otherFeedback];

    let contact = {}
    utils.getContactInfoFromSeveralFeedback(allFeedback).forEach(info => {
      _.forEach(info, (val, key) => {
        if(val !== undefined) contact[key] = contact[key] === undefined ? val : contact[key];
      })
    }) 
    

    const returnable = {
      id: _id,
      contact,
      events: [],
      processed: utils.getProcessedState(feedback, inboxSettings),
      processedByGroup: feedback.processedByGroup
    };

    
    const processingLog = _.flatten(_.flatten(
      [
        allFeedback.map(fb => fb.processingLog).filter(item => item != undefined),
        allFeedback.map(fb => _.flatten((fb.processedByGroup || []).map(group => group.log.map(o => { return {...o, group_id: group.group_id}}))).filter(item => item != undefined))
      ]
    ))

    const feedbackIds = allFeedback.map(fb => fb._id);

    const messagesQuery = { feedback_id: { $in: feedbackIds } };
    if (inboxMode == "group_assigned" && userGroups) {
      messagesQuery.group_id = { $in: userGroups.map(g => oid(g)) };
    }
    const messages = await Message.find(messagesQuery);

    const mergeEvents = [
      ...allFeedback.map(object => {
        return {
          type: "feedback",
          object,
          _id: object._id,
          created_at: object.created_at
        };
      }),
      ...processingLog.map(object => {
        return {
          type: "processing",
          object,
          _id: object._id,
          created_at: object.created_at,
          group_id: object.group_id || null
        };
      }),
      ...messages.map(object => {
        return {
          type: "message",
          object,
          _id: object._id,
          created_at: object.created_at
        };
      })
    ];
    const rawEvents = _.sortBy(_.uniqBy(mergeEvents, e => (e._id || e.created_at).toString()), 'created_at')


    returnable.events = await makeEvents(rawEvents, language);

    res.send(returnable);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "Something went wrong" });
  }
}

module.exports = { getById };
