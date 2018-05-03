import Vue from "vue";
import { createObjectMutation } from "@/utils/creators";
import {
  SET_PHASE,
  SET_ORGANIZATION_PROP,
  POST_SIGNUP_SUCCESS,
  SET_LOADING_STATE,
  SET_SIGNUP_INFO
} from "../constants";

export default {
  [SET_PHASE]: (state, payload) => {
    const { phase } = payload;
    state.currentPhase = phase;
  },
  [SET_ORGANIZATION_PROP]: createObjectMutation("organizationDetails"),
  [SET_LOADING_STATE]: (state, payload) => {
    state.loading = payload;
  },
  [POST_SIGNUP_SUCCESS]: state => {
    Vue.set(state, "signupSuccess", true);
  },
  [SET_SIGNUP_INFO]: (state, payload) => {
    state.organizationDetails = { ...state.organizationDetails, ...payload };
  }
};
