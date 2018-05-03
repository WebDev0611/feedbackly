export const HIDE_IPAD_SIGNUP = 'HIDE_IPAD_SIGNUP';
export const SHOW_IPAD_SIGNUP = 'SHOW_IPAD_SIGNUP';
export const GET_SIGNUP_STATE = 'GET_SIGNUP_STATE';
export const GET_SIGNUP_STATE_SUCCESS = 'GET_SIGNUP_STATE_SUCCESS';
export const GET_SIGNUP_STATE_FAIL = 'GET_SIGNUP_STATE_FAIL';


export const SIGNUP_STAGE_PENDING_SURVEY = 'PENDING_SURVEY';
export const SIGNUP_STAGE_PENDING_SIGNUP = 'PENDING_SIGNUP';
export const SIGNUP_STAGE_DONE = 'DONE';

const initialState = {
  show: true,
  stage: null,
};

export function hideIpadSignup() {
  return {
    type: HIDE_IPAD_SIGNUP,
  }
}

export function showIpadSignup() {
  return {
    type: SHOW_IPAD_SIGNUP,
  }
}

export function getSignupState(udid) {
    return {
    type: GET_SIGNUP_STATE,
    payload: {
      request: {
        url: process.env.CLIENT_URL+'/api/ipad-signup-stage?udid='+udid,
        method: 'get',
      }
    }
  }
}

export default function reducer( state = initialState, action) {

  switch(action.type) {
    case SHOW_IPAD_SIGNUP:
      return {
        ...state,
        show: true,
      }
    case HIDE_IPAD_SIGNUP:
      return {
        ...state,
        show: false,
    }
    case GET_SIGNUP_STATE_SUCCESS:
      return {
        ...state,
        stage: action.payload.data.stage,
      }

      default:
      return state;
  }

};
