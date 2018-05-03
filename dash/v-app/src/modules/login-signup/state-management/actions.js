import http from "@/lib/http";
import { LOGIN_SUCCESS, SET_UI_MESSAGE } from "@/constants/main";
import errorHandler from "@/utils/errorHandler";
import {
  POST_LOGIN,
  LOGIN_FAIL,
  POST_RESET_LINK,
  SET_LOGIN_PROP,
  POST_NEW_PASSWORD
} from "../constants";

export default {
  [POST_LOGIN]: async ({ state, commit, dispatch }, payload) => {
    const { email, password, rememberMe } = state.logIn;
    const response = await http.post(`/api/users/login`, {
      email,
      password,
      rememberMe
    });
    if (!response.error) {
      window.localStorage.setItem("ngStorage-user", JSON.stringify(response));
      dispatch(LOGIN_SUCCESS, { dialog: payload.dialog }, { root: true });
    } else {
      commit(LOGIN_FAIL);
    }
  },
  [POST_RESET_LINK]: async ({ state, commit }) => {
    const { email } = state.logIn;
    const response = await http.post(`/api/user/send_password_reset_link`, {
      email
    });
    if (response.error)
      commit(SET_LOGIN_PROP, { path: "resetLinkError", value: true });
    else commit(SET_LOGIN_PROP, { path: "resetLinkSent", value: true });
  },
  [POST_NEW_PASSWORD]: async ({ commit }, payload) => {
    const response = await http.post(`/api/user/change_password`, {
      password: payload.password,
      token: payload.token
    });
    if (response.error) return errorHandler(commit, response.error);
    commit(
      SET_UI_MESSAGE,
      {
        show: true,
        text: "Password changed successfully.",
        color: "success"
      },
      { root: true }
    );
    setTimeout(() => {
      window.location.href = `/v-app/login`;
    }, 3000);
  }
};
