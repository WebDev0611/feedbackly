import _ from 'lodash';
import update from 'immutability-helper';
import { properties as initialState } from '../store/initialStates';


const SET_QUESTION_TIMEOUT = 'SET_QUESTION_TIMEOUT';
const SET_FINAL_SCREEN_TIMEOUT = 'SET_FINAL_SCREEN_TIMEOUT';
const SET_REDIRECT_URL = 'SET_REDIRECT_URL';
const SET_REDIRECT_HTTPS = 'SET_REDIRECT_HTTPS';
const SET_PRIVACY_POLICY = 'SET_PRIVACY_POLICY';
const SET_END_SCREEN_TEXT = 'SET_END_SCREEN_TEXT';



export default function(state = initialState, action) {
  switch (action.type) {
  case (SET_QUESTION_TIMEOUT):
    return {
      ...state,
      question_timeout: action.timeout,
    }

  case (SET_FINAL_SCREEN_TIMEOUT):
    return {
      ...state,
      final_screen_timeout: action.timeout,
    }
  case (SET_REDIRECT_URL):
    return {
      ...state,
      redirect_url: action.url,
    }
  case (SET_REDIRECT_HTTPS):
    return {
      ...state,
      redirectHttps: action.https,
    }
  case (SET_PRIVACY_POLICY):
    return {
      ...state,
      custom_privacy_policy: action.text,
    }
  case (SET_END_SCREEN_TEXT):
    return {
      ...state,
      end_screen_text: update(state.end_screen_text, {
        [action.language]: {
          $set: action.text
        }
      })
    }

  default:
    return state;
  }
}


export function setQuestionTimeout(timeout) {
  return {
    type: SET_QUESTION_TIMEOUT,
    timeout,
  }
}

export function setFinalScreenTimeout(timeout) {
  return {
    type: SET_FINAL_SCREEN_TIMEOUT,
    timeout,
  }
}

export function setRedirectUrl(url) {
  return {
    type: SET_REDIRECT_URL,
    url,
  }

}
export function setRedirectHttps(https) {
  return {
    type: SET_REDIRECT_HTTPS,
    https,
  }

}

export function setPrivacyPolicy(text) {
  return {
    type: SET_PRIVACY_POLICY,
    text,
  }
}

export function setEndScreen(language, text) {
  return {
    type: SET_END_SCREEN_TEXT,
    language,
    text
  }
}
