import { CHANGE_CHARGE, SET_BALANCE, SET_LOAD_STATUS } from "../constants";

export default {
  [CHANGE_CHARGE]: (state, payload) => {
    state.charge = payload;
  },
  [SET_LOAD_STATUS]: (state, payload) => {
    state.loading = payload;
  },
  [SET_BALANCE]: (state, payload) => {
    state.balance = payload;
  }
};
