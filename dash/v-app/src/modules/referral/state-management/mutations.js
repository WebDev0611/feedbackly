import Vue from "vue";
import {
  SET_REFERRAL_STATUS
} from "../constants";

const mutations = {
  [SET_REFERRAL_STATUS]: (state, payload) => {
    Vue.set(state, "referralStatus", payload);
  },
};

export default mutations;
