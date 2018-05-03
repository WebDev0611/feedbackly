import Vue from "vue";
import { set, findIndex } from "lodash";
import { createObjectMutation } from "@/utils/creators";
import initialState from "./initialState";
import {vueSet} from "vue-deepset"
import {
  SET_SAVE_STATUS,
  CHANGE_ORGANIZATION_LIST,
  SET_ACTIVE_ORGANIZATION,
  SET_ORGANIZATION_PROP,
  SET_CHANNEL_PROP,
  SET_CHANNELGROUP_PROP,
  SET_USER_PROP,
  NEW_USER,
  NEW_CHANNEL,
  NEW_ORGANIZATION,
  SET_SMS_BALANCE,
  NEW_CHANNELGROUP,
  SET_LOAD_STATUS
} from "../constants";

export default {
  [CHANGE_ORGANIZATION_LIST]: (state, action) => {
    const { payload } = action;
    Vue.set(state, "organizations", payload);
  },
  [SET_ACTIVE_ORGANIZATION]: (state, action) => {
    const { payload } = action;
    Vue.set(state, "activeOrganization", payload);
  },
  [SET_ORGANIZATION_PROP]: createObjectMutation("activeOrganization.organization"),
  [SET_USER_PROP]: (state, action) => {
    let { id, path, value, isNew } = action;
    if (isNew) {
      vueSet(state, "users.newUser." + path, value);
    } else {
      const userIndex = findIndex(state.activeOrganization.users, { _id: id });
      set(state.activeOrganization.users[userIndex], path, value);
    }
  },

  [SET_CHANNEL_PROP]: (state, action) => {
    const { id, path, value, isNew } = action;
    if (isNew) {
      vueSet(state, "channels.newChannel." + path, value);
    } else {
      const channelIndex = findIndex(state.activeOrganization.channels, { _id: id });
      if (path.split(".").length === 1) {
        vueSet(state.activeOrganization.channels[channelIndex], path, value);
      } else Vue.set(state.activeOrganization.channels[channelIndex], "", value);
    }
  },

  [SET_CHANNELGROUP_PROP]: (state, action) => {
    const { id, path, value, isNew } = action;
    if (isNew) {
      const obj = { ...state.channelgroups.newChannelgroup };
      set(obj, path, value);
      state.channelgroups.newChannelgroup = { ...obj };
    } else {
      const channelgroupIndex = findIndex(state.activeOrganization.channelGroups, { _id: id });
      const obj = { ...state.activeOrganization.channelGroups[channelgroupIndex] };
      set(obj, path, value);
      if (path.split(".").length === 1)
        state.activeOrganization.channelGroups[channelgroupIndex][path] = value;
      else state.activeOrganization.channelGroups[channelgroupIndex] = obj;
    }
  },

  [SET_SAVE_STATUS]: (state, action) => {
    const { status } = action;
    state.saveStatus = status;
  },
  [NEW_ORGANIZATION]: state => {
    state.activeOrganization = { ...initialState("activeOrganization").activeOrganization };
  },
  [NEW_CHANNEL]: state => {
    state.channels.newChannel = { ...initialState("channels").channels.newChannel };
  },
  [NEW_USER]: state => {
    state.users.newUser = { ...initialState("users").users.newUser };
  },
  [SET_SMS_BALANCE]: (state, payload) => {
    state.activeOrganization = { ...state.activeOrganization, smsBalance: payload };
  },
  [NEW_CHANNELGROUP]: state => {
    state.channelgroups.newChannelgroup = {
      ...initialState("channelgroups").channelgroups.newChannelgroup
    };
  },
  [SET_LOAD_STATUS]: (state, payload) => {
    Vue.set(state, "loadStatus", payload);
  }
};
