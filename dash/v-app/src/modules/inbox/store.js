export default {
  namespaced: true,
  actions: require("./state-management/actions").default,
  mutations: require("./state-management/mutations").default,
  state: require("./state-management/initialState").default
};
