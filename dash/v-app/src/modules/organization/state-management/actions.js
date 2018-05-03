import errorHandler from "@/utils/errorHandler";
import { get } from "lodash"
import http from "../../../lib/http";
import {
  GET_ORGANIZATION,
  SET_ORGANIZATION,
  PUT_ORGANIZATION,
  GET_USERS,
  SET_USERS,
  SET_USER,
  GET_USER,
  SAVE_USER,
  GET_USER_CHANNELTREE,
  SET_USER_CHANNELTREE,
  SAVE_CREDIT_CARD_TOKEN,
  SET_LOADING_STATE,
  CHANGE_PLAN,
  GET_API_KEYS,
  SET_API_KEYS,
  REVOKE_API_KEY,
  GENERATE_API_KEY,
  DELETE_USER,
} from "../constants";

import { SET_UI_MESSAGE } from "@/constants/main";

const actions = {
  [GET_ORGANIZATION]: async ({ commit }) => {
    commit(SET_LOADING_STATE, true);
    const payload = await http.get(`/api/v2/organization`);
    commit(SET_LOADING_STATE, false);
    if (payload.error) return errorHandler(commit, payload.error);
    commit(SET_ORGANIZATION, payload);
  },
  [PUT_ORGANIZATION]: async ({ state, commit }, payload) => {
    commit(SET_LOADING_STATE, true);
    const organization = state.selectedOrganization;
    const result = await http.put(`/api/v2/organizations/${organization._id}`, {
      ...organization,
      ...payload
    });
    commit(SET_LOADING_STATE, false);
    if (result.error) return errorHandler(commit, result.error);
    commit(
      SET_UI_MESSAGE,
      { text: "Organization updated successfully.", color: "success" },
      { root: true }
    );
    return false; // <-- returns a value to hide dialog
  },
  [GET_USERS]: async ({ commit }) => {
    commit(SET_LOADING_STATE, true);
    const payload = await http.get(`/api/v2/users`);
    commit(SET_LOADING_STATE, false);
    if (payload.error) return errorHandler(commit, payload.error);
    commit(SET_USERS, payload);
  },
  [GET_USER]: async ({ commit, dispatch }, { id }) => {
    commit(SET_LOADING_STATE, true);
    const payload = await http.get(`/api/users/${id}`);
    commit(SET_LOADING_STATE, false);
    if (payload.error) return errorHandler(commit, payload.error);
    commit(SET_USER, payload);
    dispatch(GET_USER_CHANNELTREE);
  },
  [GET_USER_CHANNELTREE]: async ({ commit }) => {
    commit(SET_LOADING_STATE, true);
    const payload = await http.get(`/api/devices/tree`);
    commit(SET_LOADING_STATE, false);
    if (payload.error) return errorHandler(commit, payload.error);
    commit(SET_USER_CHANNELTREE, payload);
  },
  [SAVE_USER]: async ({ dispatch, commit, state }) => {
    commit(SET_LOADING_STATE, true);
    let result;
    if (state.selectedUser._id) {
      result = await http.put(
        `/api/v2/users/${state.selectedUser._id}`,
        state.selectedUser
      );
    } else {
      result = await http.post(`/api/v2/users`, state.selectedUser);
    }
    commit(SET_LOADING_STATE, false);
    if (result.error) return errorHandler(commit, result.error);
    dispatch(GET_USERS);
    commit(
      SET_UI_MESSAGE,
      { text: "User saved successfully.", color: "success" },
      { root: true }
    );
  },
  [SAVE_CREDIT_CARD_TOKEN]: async ({ dispatch, commit }, payload) => {
    commit(SET_LOADING_STATE, true);
    const response = await http.post(
      `/api/v2/organizations/credit-card-token`,
      payload
    );
    commit(SET_LOADING_STATE, false);
    if (response.error) return errorHandler(commit, response.error);
    return dispatch(GET_ORGANIZATION);
  },
  [CHANGE_PLAN]: async ({ commit }, payload) => {
    commit(SET_LOADING_STATE, true);
    const response = await http.post(`/api/v2/organizations/change-plan`, {
      plan: payload
    });
    if (response.error) return errorHandler(commit, response.error);
    commit(SET_LOADING_STATE, false);
  },
  [GET_API_KEYS]: async ({ commit, state }) => {
    const userId = get(state, "selectedUser._id");
    if (!userId) return;
    commit(SET_LOADING_STATE, true);
    const response = await http.get(`/api/v2/users/${userId}/apikeys`);
    commit(SET_LOADING_STATE, false);
    if (response.error) return errorHandler(commit, response.error);
    commit(SET_API_KEYS, response);
  },
  [GENERATE_API_KEY]: async ({ commit, state, dispatch }) => {
    const userId = get(state, "selectedUser._id");
    if (!userId) return;
    commit(SET_LOADING_STATE, true);
    const response = await http.post(`/api/v2/users/${userId}/apikeys/generate`);
    commit(SET_LOADING_STATE, false);
    if (response.error) return errorHandler(commit, response.error);
    dispatch(GET_API_KEYS);
  },
  [REVOKE_API_KEY]: async ({ commit, state, dispatch }, payload) => {
    const { id, revoke } = payload;
    const userId = get(state, "selectedUser._id");
    if (!userId) return;
    commit(SET_LOADING_STATE, true);
    const response = await http.put(`/api/v2/users/${userId}/apikeys/${id}/revoke`, { revoke })
    commit(SET_LOADING_STATE, false);
    if (response.error) return errorHandler(commit, response.error);
    dispatch(GET_API_KEYS);
  },
  [DELETE_USER]: async ({ state, commit, dispatch }) => {
    const userId = get(state, "selectedUser._id");
    if (!userId) return;
    commit(SET_LOADING_STATE, true);
    const response = await http.delete(`/api/v2/users/${userId}`);
    commit(SET_LOADING_STATE, false);
    if (response.error) return errorHandler(commit, response.error);
    dispatch(GET_USERS);
  }
};

export default actions;
