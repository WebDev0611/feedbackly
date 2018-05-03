import objectId from 'bson-objectid';
import async from 'async';
import { findIndex, get } from 'lodash';
import UserAgent from 'user-agent-parser';
import { pushToBuffer, getBuffer, removeFromBuffer } from 'utils/fbevent-buffer';
import { getQueryParameterByName } from 'utils/url';
import * as kioskClient from 'utils/kiosk-client';

import { cardsSelector } from 'selectors/active-card';

export const ADD_FBEVENT = 'ADD_FBEVENT';
export const SAVE_FBEVENT = 'SAVE_FBEVENT';
export const SET_FBEVENT_BUFFER_SIZE = 'SET_FBEVENT_BUFFER_SIZE';
export const SET_FBEVENT_BUFFER_SAVING_STATUS = 'SET_FBEVENT_BUFFER_SAVING_STATUS';
export const SET_FEEDBACK_ID = 'SET_FEEDBACK_ID';
export const SET_FEEDBACK_CHAIN_STARTED_AT = 'SET_FEEDBACK_CHAIN_STARTED_AT';
export const SET_FEEDBACKS_MAP = 'SET_FEEDBACKS_MAP';


var serialize = function(obj, prefix) {
  var str = [], p;
  for(p in obj) {
    if (obj.hasOwnProperty(p)) {
      var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
      str.push((v !== null && typeof v === "object") ?
        serialize(v, k) :
        encodeURIComponent(k) + "=" + encodeURIComponent(v));
    }
  }
  return str.join("&");
}

function readMetaFromQuery() {
  var meta = {};
  let urlMeta = getQueryParameterByName('meta');

  if(urlMeta) {
    try {
      meta = JSON.parse(decodeURIComponent(urlMeta));
    } catch(exception) {}
  }

  var newMeta = getQueryParameterByName('fmeta') || getQueryParameterByName('_')

  if(newMeta){
    try{
      const fields = newMeta.split(";");
      fields.forEach((v) => {
        var keyVal= v.split(":")
        meta = Object.assign({}, meta, {[keyVal[0]]: keyVal[1]})
      })
    } catch(err){console.log(err)}
  }
  return meta;
}

function readMetaFromUserAgent() {
  const { browser, device, os } = new UserAgent(window.navigator.userAgent).getResult();

  return { browser, device, os };
}

function getPresetMetaKey(){
  var key = getQueryParameterByName('_z');
  return key;
}

export function addFbevent(payload) {
  return (dispatch, getState) => {
    const state = getState();

    const { survey, organization, channel, view, fbevents, language  } = state;
    const { data, question } = payload;

    const utcOffsetSeconds = new Date().getTimezoneOffset() * (-1) * 60;
    const unix = Math.floor(new Date().getTime() / 1000);

    let feedbacks = Object.assign({}, fbevents.feedbacksMap || {}, { [question._id]: data })
    let feedbackId = fbevents.feedbackId;
    let chainStartedAt = fbevents.chainStartedAt;

    if(fbevents.feedbackId === undefined) {
      feedbackId = objectId().toHexString();

      dispatch(setFeedbackId(feedbackId));
    }

    if(fbevents.chainStartedAt === undefined) {
      chainStartedAt = unix + utcOffsetSeconds;

      dispatch(setFeedbackChainStartedAt(chainStartedAt));
    }

    if(fbevents.feedbacksMap === undefined) {
      dispatch(setFeedbacksMap(feedbacks));
    }

    if(view.isPreview === true) {
      return;
    }

    const questionIndex = findIndex(cardsSelector(state), card => card._id === question._id);
    const isFirst = questionIndex === 0;
    const isLast = questionIndex == cardsSelector(state).length-2;

    dispatch(setFeedbacksMap(feedbacks));

    let fbevent = {
      _id: objectId().toHexString(),
      _isFirst: isFirst ? '1' : '0',
      question_id: question._id,
      feedback_id: feedbackId,
      device_id: channel._id,
      organization_id: organization._id,
      data: data,
      question_type: question.question_type,
      survey_id: survey._id,
      created_at_adjusted_ts: unix + utcOffsetSeconds,
      chain_started_at: chainStartedAt,
      created_at: new Date(),
      feedbacks,
      meta_browser: Object.assign({}, readMetaFromUserAgent()),
      meta_query: readMetaFromQuery(),
      channel_type: channel.type,
      language,
      isLast,
      profanityFilter: organization.profanityFilter === 'enabled' || organization.profanityFilter === 'device-specific' && channel.profanityFilter === true,
    }

    try{
      if(localStorage.getItem("focuses")) fbevent.focuses = JSON.parse(localStorage.getItem("focuses"))
    }catch(e){}

    if(getPresetMetaKey()){
      fbevent.presetMetaKey = getPresetMetaKey()
    }

    pushToBuffer(fbevent);

    dispatch(clearFbeventBuffer());
  }
}

export function clearFbeventData(){
  return (dispatch, getState) => {
    dispatch(setFeedbackId(undefined));
    dispatch(setFeedbackChainStartedAt(undefined));
    dispatch(setFeedbacksMap(undefined));
  }
}

export function saveFbevent(fbevent) {
  return {
    type: SAVE_FBEVENT,
    payload: {
      request: {
        url: '/fbevents',
        method: 'post',
        data: fbevent
      }
    }
  }
}

export function setFeedbackChainStartedAt(unix) {
  return {
    type: SET_FEEDBACK_CHAIN_STARTED_AT,
    unix
  }
}

export function setFbeventBufferSize(size) {
  return {
    type: SET_FBEVENT_BUFFER_SIZE,
    size
  }
}

export function setFeedbackId(id) {
  return {
    type: SET_FEEDBACK_ID,
    id
  }
}

export function setFeedbacksMap(map) {
  return {
    type: SET_FEEDBACKS_MAP,
    map
  }
}

export function setFbeventBufferSavingStatus(status) {
  return {
    type: SET_FBEVENT_BUFFER_SAVING_STATUS,
    status
  }
}

window.removeFromBuffer = removeFromBuffer;

export function clearFbeventBuffer() {
  return (dispatch, getState) => {
    const state = getState();

    if(!state.fbevents.savingBuffer) {
      dispatch(setFbeventBufferSavingStatus(true));
      dispatch(setFbeventBufferSize(getBuffer().length));

      async
        .eachLimit(getBuffer(), 10, (fbevent, callback) => {
          kioskClient.postMessage(serialize(fbevent), 'PLAIN')
          dispatch(saveFbevent(fbevent))
            .then((a) => {
              if(a.type === "SAVE_FBEVENT_SUCCESS"){
                var id = get(a,"payload.data._id");
                if(id) removeFromBuffer(id);
                return callback();
              } else {
                console.log("Couldn't save Fbevent buffer. Still trying.")
                return callback();
              }
            })
            .catch(err => {
              return callback();
            });
        }, err => {
            if(err) {
              console.error(err);
            }

            dispatch(setFbeventBufferSavingStatus(false));
            dispatch(setFbeventBufferSize(getBuffer().length));
        });
    }

  }
}
