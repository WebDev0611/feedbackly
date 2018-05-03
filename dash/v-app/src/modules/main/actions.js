import { get } from "lodash";
import http from "@/lib/http";
import errorHandler from "@/utils/errorHandler";

import {
  PING_LOGIN,
  SET_LOGIN_STATE,
  LOGIN_SUCCESS,
  GET_USER_DETAILS,
  SET_USER_DETAILS,
  GET_ORGANIZATION_CHARGES,
  SET_ORGANIZATION_CHARGES,
  POST_RESET_LINK,
  SET_UI_MESSAGE
} from "../../constants/main";

export default {
  [PING_LOGIN]: async ({ commit }) => {
    const response = await http.get("/api/v2/ping");
    if (response.error && response.error.status === 401) {
      commit(SET_LOGIN_STATE, false);
    }
  },
  [LOGIN_SUCCESS]: ({ commit, state }, payload) => {
    commit(SET_LOGIN_STATE, true);
    if (payload.dialog === true) return;
    if (state.forwardToAfterLogin !== null)
      window.location.href = `/v-app/#${state.forwardToAfterLogin}`;
    else window.location.href = "/app";
  },
  [GET_USER_DETAILS]: async ({ commit }, payload) => {
    const { fields } = payload;
    const result = await http.get(`/api/user-rights?fields=${fields}`);
    if (result.error) return errorHandler(commit, result.error);
    return commit(SET_USER_DETAILS, result);
  },
  [GET_ORGANIZATION_CHARGES]: async ({ commit }, payload) => {
    const { organizationId } = payload;
    const result = await http.get(
      `/api/v2/organization/charges?organization_id=${organizationId}`
    );
    if (result.error) return errorHandler(commit, result.error);
    return commit(SET_ORGANIZATION_CHARGES, result);
  },
  [POST_RESET_LINK]: async ({ state, commit }, payload) => {
    const email = payload || get(state, "logIn.email");
    const result = await http.post(`/api/user/send_password_reset_link`, {
      email
    });
    if (result.error) return errorHandler(commit, result.error);
    return commit(SET_UI_MESSAGE, {
      text: "Password reset link sent",
      color: "primary"
    });
  }
};
