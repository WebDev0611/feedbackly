import { find } from "lodash";
import HTTP from "@/lib/http";
import errorHandler from "../../../utils/errorHandler";

import {
  SET_SAVE_STATUS,
  SAVE_STATUS_SAVING,
  SAVE_STATUS_DONE,
  CHANGE_ORGANIZATION_LIST,
  GET_ORGANIZATIONS,
  GET_ORGANIZATION_BY_ID,
  SET_ACTIVE_ORGANIZATION,
  SAVE_USER,
  SAVE_ORGANIZATION,
  SAVE_CHANNEL,
  SAVE_CHANNELGROUP,
  LOGIN_AS_USER,
  CREATE_NEW_ORGANIZATION,
  GET_SMS_BALANCE,
  SET_SMS_BALANCE,
  TOP_UP_SMS,
  SET_LOAD_STATUS,
  DELETE_CHANNELGROUP,
  DELETE_CHANNEL
} from "../constants";

export const NAMESPACE = "admin";

export default {
  [CREATE_NEW_ORGANIZATION]: async (__, action) => {
    const { name, segment } = action;
    await HTTP.post("/api/admin/organizations", { name, segment });
  },
  [GET_ORGANIZATIONS]: async ({ commit }) => {
    const result = await HTTP.get("/api/admin/organizations");
    if (result.error) return errorHandler(commit, result.error);
    commit({ type: CHANGE_ORGANIZATION_LIST, payload: result });
  },
  [GET_ORGANIZATION_BY_ID]: async ({ commit }, action) => {
    const { payload } = action;
    const { id } = payload;
    const result = await HTTP.get(`/api/v2/organizations/${id}`);
    if (result.error) return errorHandler(commit, result.error);
    commit({ type: SET_ACTIVE_ORGANIZATION, payload: result });
  },

  [SAVE_USER]: async ({ dispatch, commit, state }, action) => {
    commit({ type: SET_SAVE_STATUS, status: SAVE_STATUS_SAVING });
    const organizationId = state.activeOrganization.organization._id;
    let user;
    if (action.isNew) user = state.users.newUser;
    else user = find(state.activeOrganization.users, { _id: action.id });
    if (user._id) {
      const result = await HTTP.put(`/api/v2/users/${user._id}?org=${organizationId}`, user);
    } else {
      const result = await HTTP.post(`/api/v2/users?org=${organizationId}`, user);
    }
    // TODO: error handling

    commit({ type: SET_SAVE_STATUS, status: SAVE_STATUS_DONE });
    dispatch({ type: GET_ORGANIZATION_BY_ID, payload: { id: organizationId } });
  },
  [SAVE_ORGANIZATION]: async ({ dispatch, commit, state }) => {
    commit({ type: SET_SAVE_STATUS, status: SAVE_STATUS_SAVING });
    const { organization } = state.activeOrganization;
    let result;
    if (organization._id) {
      result = await HTTP.put(`/api/v2/organizations/${organization._id}`, organization);
    } else {
      result = await HTTP.post(`/api/v2/organizations`, organization);
    }
    // TODO: error handling

    commit({ type: SET_SAVE_STATUS, status: SAVE_STATUS_DONE });
    dispatch({ type: GET_ORGANIZATION_BY_ID, payload: { id: result._id } });
  },

  [SAVE_CHANNEL]: async ({ dispatch, commit, state }, action) => {
    commit({ type: SET_SAVE_STATUS, status: SAVE_STATUS_SAVING });
    const organizationId = state.activeOrganization.organization._id;
    let channel;
    let result;
    if (action.isNew) channel = state.channels.newChannel;
    else channel = find(state.activeOrganization.channels, { _id: action.id });
    if (channel._id) {
      result = await HTTP.put(`/api/v2/channels/${channel._id}`, channel);
    } else {
      result = await HTTP.post(`/api/v2/channels`, { ...channel, organization_id: organizationId });
    }
    commit({ type: SET_SAVE_STATUS, status: SAVE_STATUS_DONE });
    if (result.error) return errorHandler(commit, result.error);
    dispatch({ type: GET_ORGANIZATION_BY_ID, payload: { id: organizationId } });
    return result._id;
  },

  [SAVE_CHANNELGROUP]: async ({ dispatch, commit, state }, action) => {
    commit({ type: SET_SAVE_STATUS, status: SAVE_STATUS_SAVING });
    const organizationId = state.activeOrganization.organization._id;
    let channelgroup;
    let result;
    if (action.isNew) channelgroup = state.channelgroups.newChannelgroup;
    else channelgroup = find(state.activeOrganization.channelGroups, { _id: action.id });
    if (!channelgroup.organization_id) channelgroup.organization_id = organizationId;
    if (channelgroup._id) {
      result = await HTTP.put(`/api/v2/channelgroups/${channelgroup._id}`, channelgroup);
    } else {
      result = await HTTP.post(`/api/v2/channelgroups`, channelgroup);
    }
    commit({ type: SET_SAVE_STATUS, status: SAVE_STATUS_DONE });
    await dispatch({ type: GET_ORGANIZATION_BY_ID, payload: { id: organizationId } });
    return result._id;
  },
  [LOGIN_AS_USER]: async (__, payload) => {
    const { userId, organizationId } = payload;

    const loginToken = await HTTP.post(`/api/admin/login_token`, {
      userId,
      organizationId
    });

    // todo: error handling

    const userData = await HTTP.post(`/api/users/login`, {
      token: loginToken.token
    });

    // todo: error handling

    document.cookie.replace(/(?:(?:^|.*;\s*)jwt\s*\=\s*([^;]*).*$)|^.*$/, `jwt=${userData.jwt}`);
    window.localStorage.setItem("ngStorage-user", JSON.stringify(userData));
    window.location.href = "/app";
  },
  [GET_SMS_BALANCE]: async ({ state, commit }) => {
    const { _id } = state.activeOrganization.organization;
    const response = await HTTP.get(`/api/v2/sms/balance?organization_id=${_id}`);
    if (response.error) return errorHandler(commit, response.error);
    commit(SET_SMS_BALANCE, response.balance);
  },
  [TOP_UP_SMS]: async ({ state, commit }, payload) => {
    const { _id } = state.activeOrganization.organization;
    const { charge } = payload;
    const response = await HTTP.post(`/api/v2/sms/top-up-admin`, {
      organization_id: _id,
      charge,
      currency: "EUR"
    });
    if (response.error) return errorHandler(commit, response.error);
    commit(SET_SMS_BALANCE, response.balance);
  },
  [DELETE_CHANNELGROUP]: async ({ commit }, payload) => {
    const { id } = payload;
    commit(SET_LOAD_STATUS, true);
    const response = await HTTP.delete(`/api/v2/channelgroups/${id}`);
    commit(SET_LOAD_STATUS, false);
    if (response.error) return errorHandler(commit, response.error);
    return true;
  },
  [DELETE_CHANNEL]: async ({ commit }, payload) => {
    const { id } = payload;
    commit(SET_LOAD_STATUS, true);
    const response = await HTTP.delete(`/api/devices/${id}`);
    commit(SET_LOAD_STATUS, false);
    if (response.error) return errorHandler(commit, response.error);
    return true;
  }
};
