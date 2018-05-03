import http from "@/lib/http";
import errorMessage from "@/utils/errorHandler";
import showMessage from "@/utils/showMessage";

import {
  GET_BALANCE,
  POST_TOP_UP,
  SET_BALANCE,
  SET_LOAD_STATUS,
  CHANGE_CHARGE
} from "../constants";

export default {
  [GET_BALANCE]: async ({ commit }) => {
    const result = await http.get("/api/v2/sms/balance");
    if (!result.error) {
      commit(SET_BALANCE, result);
    } else {
      errorMessage(commit, result.error);
    } // handle error
  },
  [POST_TOP_UP]: async ({ state, commit }) => {
    const { charge, currency } = state;
    commit(SET_LOAD_STATUS, true);
    const result = await http.post("/api/v2/sms/top-up", { charge, currency });
    if (!result.error) {
      commit(CHANGE_CHARGE, 0);
      commit(SET_BALANCE, result);
      showMessage(commit, {
        text: `Topped up ${charge}€ successfully.`,
        color: "success"
      });
      commit(SET_LOAD_STATUS, false);
    } else {
      commit(SET_LOAD_STATUS, false);
      errorMessage(commit, result.error);
    }
  }
};
