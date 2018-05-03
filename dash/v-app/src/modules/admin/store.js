import initialState from "./state-management/initialState";
import actions from "./state-management/actions";
import mutations from "./state-management/mutations";

export const NAMESPACE = "admin";

export default {
  actions,
  mutations,
  namespaced: true,
  state: initialState()
};
