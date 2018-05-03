import {
  TOGGLE_PROCESSED,
  SET_INBOX_DETAILS,
  SET_INBOX_LIST,
  SET_FETCH_OPTS
} from "../constants";

import { forEach } from "lodash";
import { createObjectMutation } from "@/utils/creators";

const mutations = {
  [SET_INBOX_LIST]: (state, payload) => {
    state.inboxList = { ...payload };
  },
  [SET_INBOX_DETAILS]: (state, { payload, id }) => {
    state.inboxDetails = {
      surveyDetails: { ...payload },
      id
    };
  },
  [SET_FETCH_OPTS]: createObjectMutation("fetchOptions")
};

export default mutations;
