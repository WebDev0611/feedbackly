import actions from "./state-management/actions";
import mutations from "./state-management/mutations";
import state from "./state-management/initialState";

export const NAMESPACE = "referral";

export default {
  namespaced: true,
  actions,
  mutations,
  state
};
