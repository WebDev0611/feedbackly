<template>
  <v-layout row>
    <v-flex xs12 sm3>
      <v-card class="full-height elevation-0">
        <v-list>
          <v-list-tile>
            <v-text-field single-line v-model="filter" append-icon="search"></v-text-field>
          </v-list-tile>
          <list-stagger height="56px">
            <v-list-tile avatar v-for="user in userList" v-bind:key="user._id" @click="selectUser(user._id)" :class="selectedClass(user._id)">
              <v-list-tile-action>
                <v-icon v-if="user.organization_admin" class="pink--text">supervisor_account</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title v-text="user.displayname"></v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </list-stagger>
        </v-list>
      </v-card>
    </v-flex>
    <v-flex xs12 sm9>
      <v-card v-if="activeUser" class="elevation-0 ml-1 full-height">
        <v-card-title primary-title>
          <div>
            <div class="headline">
              <v-icon v-if="activeUser.organization_admin" class="pink--text">supervisor_account</v-icon>
              {{activeUser.isNew && !activeUser.displayname ? 'New User' : activeUser.displayname}}
            </div>
            <span class="grey--text" v-if="!activeUser.isNew">
              <translate>Joined</translate>: {{activeUser.member_since | date}} <br> <translate>Signed in</translate>
              <b>{{ activeUser.signInCount || 0 }}</b> times</span>
          </div>
          <div class="text-xs-right top-right">
            <v-btn round primary dark v-if="!this.isNew" @click="LOGIN_AS_USER({userId: activeUser._id, organizationId})" v-translate>
              Sign in as user
            </v-btn>

            <v-btn fab small ripple @click="newUserClick">
              <v-icon>add</v-icon>
            </v-btn>

            <v-btn fab small :loading="saving" :disabled="saving" class="teal white--text" @click="() => SAVE_USER({id: userId, isNew})">
              <v-icon>save</v-icon>
            </v-btn>
          </div>
        </v-card-title>
        <v-card-text>
          <v-subheader>
            <translate>Information</translate>
          </v-subheader>
          <v-card class="grey lighten-4 elevation-0">
            <v-card-text>
              <v-layout row>
                <v-flex xs12 sm6 class="pl-4 pr-4">
                  <v-text-field :value="activeUser.displayname" :label="$gettext('User name')" @input="(value) => setUserProp({path: 'displayname', value})"></v-text-field>
                </v-flex>
                <v-flex xs12 sm6 class="pl-4 pr-4">
                  <v-select :value="activeUser.settings.locale" :items="dashboardLanguages" :label="$gettext('Dashboard language')" @input="(value) => setUserProp({path: 'settings.locale', value})" bottom item-text="label" item-value="value"></v-select>
                </v-flex>
              </v-layout>
              <v-layout row>
                <v-flex xs12 sm6 class="pl-4 pr-4">
                  <v-text-field :value="activeUser.email" @input="(value) => setUserProp({path: 'email', value})" :label="$gettext('Email')"></v-text-field>
                </v-flex>
                <v-flex xs12 sm4 class="pl-4 pr-4">
                  <v-text-field :label="$gettext('New password')" :hint="$gettext('At least 8 characters')" @input="(value) => setUserProp({path: 'password', value})" :value="activeUser.password" min="8" :prepend-icon="showPassword ? 'visibility_off' : 'visibility'" :prepend-icon-cb="() => (showPassword = !showPassword)" :type="showPassword ? 'text' : 'password'"></v-text-field>
                </v-flex>
                <v-flex xs12 sm2 class="pl-1 pr-1 pt-2">
                  <v-btn flat primary>
                    <translate>Reset link</translate> &nbsp;
                    <v-icon>send</v-icon>
                  </v-btn>
                </v-flex>
              </v-layout>
            </v-card-text>
          </v-card>

          <v-subheader>
            <translate>Settings</translate>
          </v-subheader>
          <v-card class="grey lighten-4 elevation-0">
            <v-card-text>
              <v-layout row>
                <v-flex xs12 sm6>
                  <v-switch value :input-value="activeUser.rights.survey_create" @change="(value) => setUserProp({path: 'rights.survey_create', value})" :label="$gettext('Allow create surveys')" color="indigo" hide-details></v-switch>
                </v-flex>
                <v-flex xs12 sm6>
                  <v-switch value :input-value="activeUser.settings.receive_digest" @change="(value) => setUserProp({path: 'settings.receive_digest', value})" :label="$gettext('Receive digest')" color="indigo" hide-details></v-switch>
                </v-flex>
              </v-layout>
              <v-layout row>
                <v-flex xs12 sm6>
                  <v-switch value :input-value="activeUser.organization_admin" @change="(value) => setUserProp({path: 'organization_admin', value})" :label="$gettext('Organization admin')" color="red" hide-details></v-switch>
                </v-flex>
              </v-layout>
            </v-card-text>
          </v-card>

          <v-subheader>
            <translate>Rights to groups</translate>
          </v-subheader>
          <v-card class="grey lighten-4 elevation-0 pa-3">
            <ChannelTree :selected="activeUser.rights.devicegroups" :channel-tree="channelTree" selection-mode="group" :on-change="(value) => setUserProp({path: 'rights.devicegroups', value})" :start-collapsed="true" />
          </v-card>

        </v-card-text>
      </v-card>

      <v-card v-else class="elevation-0 ml-1">
        <v-card-text v-translate>
          Select a user or add a new one.
        </v-card-text>
      </v-card>
    </v-flex>
    <span style="display:none">
      <translate>User name</translate>
      <translate>Dashboard language</translate>
      <translate>Email</translate>
      <translate>New password</translate>
      <translate>Allow create surveys</translate>
      <translate>Receive digest</translate>
      <translate>Organization admin</translate>
      <translate>At least 8 characters</translate>
    </span>
  </v-layout>

</template>


<script>
/* eslint-disable */
import { mapMutations, mapState, mapActions } from "vuex";
import { without, find } from "lodash";
import { NAMESPACE } from "./store";
import { NEW_USER, SET_USER_PROP, SAVE_USER, SAVE_STATUS_SAVING, LOGIN_AS_USER } from "./constants";
import ChannelTree from "../../components/ChannelTree";
import { date } from "../../utils/filters";

export default {
  name: "Users",
  components: {
    ChannelTree
  },
  methods: {
    ...mapMutations(NAMESPACE, [SET_USER_PROP, NEW_USER]),

    ...mapActions(NAMESPACE, [SAVE_USER, LOGIN_AS_USER]),

    selectUser(id) {
      this.$router.push({ name: "admin.Users.edit", params: { userId: id } });
    },
    setUserProp(payload) {
      this[SET_USER_PROP]({ ...payload, id: this.userId, isNew: this.isNew });
    },
    newUserClick() {
      this[NEW_USER]();
      this.$router.push({ name: "admin.Users" });
    },
    selectedClass(id) {
      return this.activeUser._id == id ? "grey lighten-3" : "";
    }
  },
  computed: {
    ...mapState(NAMESPACE, {
      organizationId: state => state.activeOrganization.organization._id,
      users: state => state.activeOrganization.users,
      channelTree: state => state.activeOrganization.channelTree,
      saving: state => state.saveStatus == SAVE_STATUS_SAVING,
      newUser: state => state.users.newUser
    }),
    ...mapState("route", {
      userId: state => state.params.userId,
      isNew: state => state.params.userId == undefined
    }),
    activeUser() {
      const user = this.isNew ? this.newUser : find(this.users, { _id: this.userId });
      return user;
    },
    userList() {
      return (this.users || []).filter(
        u => (u.displayname || "").toLowerCase().indexOf((this.filter || "").toLowerCase()) > -1
      );
    }
  },
  filters: {
    date
  },

  data() {
    return {
      dashboardLanguages: [
        { label: this.$gettext("Finnish"), value: "fi" },
        { label: this.$gettext("English"), value: "en" },
        { label: this.$gettext("Swedish"), value: "se" },
        { label: this.$gettext("Spanish"), value: "es" }
      ],
      filter: "",
      showPassword: false
    };
  }
};
</script>

<style scoped>
.top-right {
  position: absolute;
  top: 16px;
  right: 16px;
}

.list__tile__action {
  min-width: 35px;
}
</style>
