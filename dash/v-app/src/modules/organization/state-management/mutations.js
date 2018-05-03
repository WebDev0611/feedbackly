import Vue from "vue";
import { createObjectMutation } from "@/utils/creators";
import {
  SET_ORGANIZATION_PROP,
  SET_USER_PROP,
  SET_ORGANIZATION,
  SET_USERS,
  SET_USER,
  SET_USER_CHANNELTREE,
  SET_LOADING_STATE,
  SET_API_KEYS,
  SET_NEW_USER
} from "../constants";

const mutations = {
  [SET_ORGANIZATION_PROP]: createObjectMutation("selectedOrganization"),
  [SET_USER_PROP]: createObjectMutation("selectedUser"),
  [SET_ORGANIZATION]: (state, payload) => {
    state.selectedOrganization = {
      ...{},
      ...state.selectedOrganization,
      ...payload
    };
  },
  [SET_USERS]: (state, payload) => {
    state.userList = payload;
  },
  [SET_USER]: (state, payload) => {
    state.selectedUser = payload;
  },
  [SET_USER_CHANNELTREE]: (state, payload) => {
    if (state.selectedUser._id) {
      state.selectedUser = {
        ...{},
        ...state.selectedUser,
        channelTree: payload
      };
    } else console.warn("No user");
  },
  [SET_LOADING_STATE]: (state, payload) => {
    state.loading = payload;
  },
  [SET_API_KEYS]: (state, payload) => {
    Vue.set(state, "userApiKeys", payload);
  },
  [SET_NEW_USER]: state => {
    Vue.set(state, "selectedUser", {
      settings: {
        locale: "en"
      },
      rights: {
        survey_create: false,
        devicegroups: []
      },
      isNew: true
    });
  }
};

export default mutations;
