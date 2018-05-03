<template>
  <v-layout row>
    <v-flex xs12 sm3 class="white">
      <UserList :active-user="activeUser" :users="users" :select-user="selectUser"  />
      <v-flex xs12 class="text-xs-center">
        <v-btn flat ripple @click="SET_NEW_USER">
          <v-icon>add</v-icon>
          <translate>Add User</translate>
        </v-btn>
      </v-flex>
    </v-flex>

    <v-flex xs12 sm9>

    <UserEdit
      :save-user="SAVE_USER"
      :set-user-prop="SET_USER_PROP"
      :user="activeUser"
      :channel-tree="channelTree"
      :saving="loading"
      :dashboard-languages="dashboardLanguages"
      :post-reset-link="POST_RESET_LINK"
      :user-groups="userGroups"
      :feedback-inbox-enabled="feedbackInboxEnabled"
      :rest-api-enabled="restApiEnabled"
      :api-keys="apiKeys"
      :generate-api-key="GENERATE_API_KEY"
      :revoke-api-key="REVOKE_API_KEY"
      :add-user="SET_NEW_USER"
    ></UserEdit>


    </v-flex>
  </v-layout>
  <!-- <span>
                                                                                              user list on the left
                                                                                              user controls on the right
                                                                                              +++ new feature user group control
                                                                                            </span> -->
</template>

<script>
import { mapState, mapActions, mapMutations } from "vuex";
import { get } from "lodash";
import UserList from "@/components/UserList";
import UserEdit from "@/components/UserEdit/UserEdit";
import {
  GET_USERS,
  SAVE_USER,
  GET_USER,
  SET_USER_PROP,
  GET_API_KEYS,
  REVOKE_API_KEY,
  GENERATE_API_KEY,
  SET_API_KEYS,
  SET_NEW_USER, 
  DELETE_USER
} from "./constants";
import { POST_RESET_LINK } from "@/constants/main";
import { NAMESPACE } from "./store";
import { dashboardLanguages } from "@/constants/locales";
import FEATURES from "@/constants/features";
export default {
  components: { UserList, UserEdit },
  data() {
    return {
      dashboardLanguages
    };
  },
  computed: {
    ...mapState({
      feedbackInboxEnabled: state =>
        (get(state, "userDetails.availableFeatures") || []).indexOf(FEATURES.FEEDBACK_INBOX) > -1,
      restApiEnabled: state =>
        (get(state, "userDetails.availableFeatures") || []).indexOf(FEATURES.REST_API) > -1,
      channelTree: state => get(state, "userDetails.deviceTree") || []
    }),
    ...mapState(NAMESPACE, {
      users: state => state.userList,
      activeUser: state => state.selectedUser,
      userGroups: state => get(state, "selectedOrganization.user_groups") || [],
      apiKeys: state => state.userApiKeys,
      loading: state => state.loading,
    })
  },
  methods: {
    selectUser(id) {
      this.$router.push({ name: "organization.users.edit", params: { id } });
    },
    newUserClick: () => "",
    ...mapMutations(NAMESPACE, [SET_USER_PROP, SET_API_KEYS, SET_NEW_USER]),
    ...mapActions(NAMESPACE, [
      GET_USERS,
      GET_USER,
      SAVE_USER,
      GET_API_KEYS,
      REVOKE_API_KEY,
      GENERATE_API_KEY,
      DELETE_USER
    ]),
    ...mapActions([POST_RESET_LINK]),
    async fetchUserById() {
      if (this.$route.params.id !== undefined) {
        await this[GET_USER]({ id: this.$route.params.id });
        if (this.restApiEnabled) this[GET_API_KEYS]();
      }
    },
    async delUser(){
      await this[DELETE_USER]();
      this.$router.push({ name: "organization.users"});
      this[SET_NEW_USER]();
    }
  },
  async created() {
    this[GET_USERS]();
    await this.fetchUserById();
    if (this.restApiEnabled) this[GET_API_KEYS]();
  },
  beforeDestroy() {
    this[SET_USER_PROP]({ path: "", value: undefined });
  },
  watch: {
    $route: "fetchUserById"
  }
};
</script>
