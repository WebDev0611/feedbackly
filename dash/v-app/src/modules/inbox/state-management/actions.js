import errorHandler from "@/utils/errorHandler";
import { serialize } from "@/utils";
import http from "../../../lib/http";
import {
  FETCH_INBOX_LIST,
  FETCH_INBOX_DETAILS,
  SET_INBOX_LIST,
  SET_INBOX_DETAILS,
  TOGGLE_PROCESSED,
  POST_REPLY
} from "../constants";

const actions = {
  [TOGGLE_PROCESSED]: async ({ dispatch }, { clientId, processed }) => {
    const payload = await http.put(`/api/v2/inbox/${clientId}/process`, {
      processed
    });
    // TODO: add error handling
    dispatch(FETCH_INBOX_LIST);
  },
  [FETCH_INBOX_LIST]: async ({ state, commit }) => {
    const { fetchOptions } = state;
    const query = serialize(fetchOptions);
    const payload = await http.get(`/api/v2/inbox${query}`);
    // TODO: add error handling
    commit(SET_INBOX_LIST, payload);
  },
  [FETCH_INBOX_DETAILS]: async ({ commit }, { id }) => {
    const payload = await http.get(`/api/v2/inbox/${id}`);
    // TODO: add error handling
    commit(SET_INBOX_DETAILS, { payload, id });
  },
  [POST_REPLY]: async ({ commit, dispatch }, { id, form }) => {
    const payload = await http.post(`/api/v2/inbox/${id}/messages`, {
      ...form
    });
    if (payload.error) return errorHandler(commit, payload.error);
    return dispatch(FETCH_INBOX_DETAILS, { id });
  }
};

export default actions;
