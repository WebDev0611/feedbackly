import Vue from "vue";

import {
  SET_LOGIN_STATE,
  SET_FORWARD_TO,
  SET_UI_MESSAGE,
  SET_USER_DETAILS,
  SET_ORGANIZATION_CHARGES,
  SET_PRINT_INVOICE
} from "@/constants/main";

export default {
  [SET_LOGIN_STATE]: (state, payload) => {
    state.userLoggedIn = payload;
  },
  [SET_FORWARD_TO]: (state, payload) => {
    state.forwardToAfterLogin = payload;
  },
  [SET_UI_MESSAGE]: (state, payload) => {
    state.uiMessage = {
      show: payload.show || true,
      text: payload.text,
      color: payload.color,
      timeout: payload.timeout || 3500
    };
  },
  [SET_USER_DETAILS]: (state, payload) => {
    const newState = { ...state.userDetails, ...payload };
    Vue.set(state, "userDetails", newState);
  },
  [SET_ORGANIZATION_CHARGES]: (state, payload) => {
    Vue.set(state, "organizationCharges", payload);
  },
  [SET_PRINT_INVOICE]: (state, payload) => {
    Vue.set(state, "printInvoice", payload);
  }
};
