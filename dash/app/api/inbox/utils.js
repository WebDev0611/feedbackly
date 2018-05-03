const Feedback = require("../../models/feedback");
const moment = require("moment");
const _ = require("lodash");
const encryption = require("../../lib/encryption");
const oid = require('mongoose').Types.ObjectId

function getProcessedState(feedback, inboxSettings) {
  let processedState = false;

  if (feedback.processed && feedback.processed == true) processedState = true;

  if (
    inboxSettings.mode == "group_assigned" &&
    inboxSettings.user_groups &&
    inboxSettings.user_groups.length > 0
  ) {
    const processedArr = (feedback.processedByGroup || [])
      .map(processed => {
        if (inboxSettings.user_groups.indexOf(processed.group_id.toString()) > -1) {
          return processed.processed == true ? 1 : 0;
        }
      })
      .filter(b => b != undefined);
    processedState = processedArr.length > 0 ? Math.min(...processedArr) == 1 : processedState;
  }
  return processedState;
}

async function getOtherFeedbackBasedOnContactInfo(contactInfo, inboxSettings, devices) {
  if (contactInfo == null || _.keys(contactInfo).length == 0) return [];

  const query = { device_id: { $in: devices }, $or: [] };
  _.forEach(contactInfo, (val, key) => {
    query.$or.push({ [`contact.${key}`]: val });
  });

  if (
    inboxSettings.mode == "group_assigned" &&
    inboxSettings.user_groups &&
    inboxSettings.user_groups.length > 0
  ) {
    query.processedByGroup = {
      $elemMatch: {
        group_id: { $in: inboxSettings.user_groups.map(g => oid(g)) }
      }
    };
  }

  const otherFeedback = await Feedback.find(query);

  return otherFeedback;
}

async function getAllContactInfo(contactInfo, devices) {
  const feedbacks = await getOtherFeedbackBasedOnContactInfo(contactInfo, {}, devices);

  const allContacts = getContactInfoFromSeveralFeedback(feedbacks);

  return allContacts;
}

function getContactInfoFromSeveralFeedback(feedback) {
  return _.sortBy(feedback, f => {
    return -moment(f.created_at).unix();
  })
    .map(f => decryptContact(f.contact))
    .filter(f => f !== undefined);
}

function decryptContact(contactObject) {
  if (!contactObject) return;
  const obj = { ...contactObject };
  try {
    obj.email = (obj.email || "").length > 0 ? encryption.decrypt(obj.email) : undefined;
    obj.phone = (obj.phone || "").length > 0 ? encryption.decrypt(obj.phone) : undefined;
  } catch (e) {
    console.log(e);
  }
  return obj;
}

module.exports = {
  getProcessedState,
  getOtherFeedbackBasedOnContactInfo,
  getAllContactInfo,
  decryptContact,
  getContactInfoFromSeveralFeedback
};
