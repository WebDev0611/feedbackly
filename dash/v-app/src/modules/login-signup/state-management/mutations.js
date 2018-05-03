import { createObjectMutation } from "@/utils/creators";
import { SET_LOGIN_PROP, LOGIN_FAIL } from "../constants";

export default {
  [SET_LOGIN_PROP]: createObjectMutation("logIn"),
  [LOGIN_FAIL]: (state, payload) => {
    state.logIn.failed = true;
    if (payload !== undefined) state.logIn.failed = payload;
  }
};
