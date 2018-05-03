import initialState from "./state-management/initialState";
import actions from "./state-management/actions";
import mutations from "./state-management/mutations";

export const NAMESPACE = "organization";

export default {
  namespaced: true,
  state: initialState,
  actions,
  mutations
};
