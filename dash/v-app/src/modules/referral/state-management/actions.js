import errorHandler from "@/utils/errorHandler";
import {get} from "lodash";
import http from "../../../lib/http";
import {
  GET_REFERRAL_STATUS,
  SET_REFERRAL_STATUS
} from "../constants";

const actions = {
  [GET_REFERRAL_STATUS]: async ({commit}) => {
    const result = await http.get(
      `/api/v2/referral-status/`
    );
    if (result.error) return errorHandler(commit, result.error);
    return commit(SET_REFERRAL_STATUS, result);
  }
};

export default actions;
