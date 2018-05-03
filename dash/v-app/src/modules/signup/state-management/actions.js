import http from "@/lib/http";
import errorHandler from "@/utils/errorHandler";

import {
  POST_SIGNUP,
  POST_SIGNUP_SUCCESS,
  SET_LOADING_STATE,
  GET_SIGNUP_INFO,
  SET_SIGNUP_INFO,
  POST_POPUP,
  POST_POPUP_SUCCESS,
  GET_UNIQUE_LINK,
} from "../constants";

export default {
  [POST_SIGNUP]: async ({ state, commit }) => {
    commit(SET_LOADING_STATE, true);
    const details = state.organizationDetails;
    const result = await http.post(`/api/v2/vue-signup`, details);
    if (result.error) return errorHandler(commit, result.error, 5000);
    commit(SET_LOADING_STATE, false);
    return commit(POST_SIGNUP_SUCCESS);
  },
  [GET_SIGNUP_INFO]: async ({ commit }, payload) => {
    commit(SET_LOADING_STATE, true);
    const { token } = payload;
    if (!token) return console.error("No token!");
    const result = await http.get(`/api/v2/vue-signup/${token}`);
    commit(SET_LOADING_STATE, false);
    if (result.error) return errorHandler(commit, result.error);
    return commit(SET_SIGNUP_INFO, result);
  },
  [POST_POPUP]: async ({ commit }, payload) => {
    commit(SET_LOADING_STATE, true);
    const result = await http.post(`/api/v2/referral-invitation`,payload);
    if (result.error) return errorHandler(commit, result.error, 5000);
    commit(SET_LOADING_STATE, false);
    return result;
  },
  [GET_UNIQUE_LINK]: async ({ commit }, payload) => {
    commit(SET_LOADING_STATE, true);
    const result = await http.post(`/api/v2/uniqueLink`, payload);
    if (result.error) return errorHandler(commit, result.error, 5000);
    commit(SET_LOADING_STATE, false);
    return result;
  },
};
