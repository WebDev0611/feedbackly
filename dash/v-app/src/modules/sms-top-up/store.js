import state from "./state-management/initialState";
import actions from "./state-management/actions";
import mutations from "./state-management/mutations";

export const NAMESPACE = "smstopup";

export default {
  namespaced: true,
  state,
  actions,
  mutations
};
