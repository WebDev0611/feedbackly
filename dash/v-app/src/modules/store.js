/* eslint-disable */
import Vuex from "vuex";
import admin from "./admin/store";
import inbox from "./inbox/store";
import organization from "./organization/store";
import referral from "./referral/store";
import loginSignup from "./login-signup/store";
import signup from "./signup/store";

import smstopup from "./sms-top-up/store";

import mainActions from "./main/actions";
import mainMutations from "./main/mutations";

export default new Vuex.Store({
  strict: true,
  state: {
    userLoggedIn: false,
    forwardToAfterLogin: null,
    uiMessage: {
      show: false,
      text: null,
      color: "",
      timeout: 3000
    },
    organizationCharges: {}
  },
  mutations: mainMutations,
  getters: {},
  actions: mainActions,
  modules: {
    loginSignup,
    admin,
    inbox,
    organization,
    referral,
    signup,
    smstopup
  }
});
