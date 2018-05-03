<template>
  <div>
    <v-card v-if="user" class="elevation-0 ml-1 full-height">
      <v-card-title primary-title>
        <div>
          <div class="headline">
            <v-icon v-if="user.organization_admin" class="pink--text">supervisor_account</v-icon>
            {{user.isNew && !user.displayname ? $gettext('New User') : user.displayname}}
          </div>
          <span class="grey--text" v-if="!user.isNew">
            <translate>Joined:</translate> {{user.member_since | date}} <br> <translate>Signed in</translate>
            <b>{{ user.signInCount || 0 }}</b> <translate translate-comment="Used in 'signed in x times'">times</translate></span>
        </div>
        <div class="text-xs-right top-right">

          <v-btn round primary dark v-if="!user.isNew && adminRoute" v-translate>
            Sign in as user
          </v-btn>

          <v-btn fab small :loading="saving" v-if="!user.isNew" :disabled="saving" color="red" dark @click.stop="showDeleteDialog = true">
            <v-icon>delete</v-icon>
          </v-btn>
          <v-btn fab small :loading="saving" :disabled="saving" color="teal" dark @click="() => saveUser({id: user._id, isNew: user.isNew})">
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
                <v-text-field :value="user.displayname" :label="$gettext('User name')" @input="(value) => setUserProp({path: 'displayname', value})"></v-text-field>
              </v-flex>
              <v-flex xs12 sm6 class="pl-4 pr-4">
                <v-select :value="user.settings.locale" :items="dashboardLanguages" :label="$gettext('Dashboard language')" @input="(value) => setUserProp({path: 'settings.locale', value})" bottom item-text="label" item-value="value"></v-select>
              </v-flex>
            </v-layout>
            <v-layout row>
              <v-flex xs12 sm6 class="pl-4 pr-4">
                <v-text-field :value="user.email" @input="(value) => setUserProp({path: 'email', value})" :label="$gettext('Email')"></v-text-field>
              </v-flex>
              <v-flex xs12 sm4 class="pl-4 pr-4">
                <v-text-field :label="$gettext('New password')" :hint="$gettext('At least 8 characters')" @input="(value) => setUserProp({path: 'password', value})" :value="user.password" min="8" :prepend-icon="showPassword ? 'visibility_off' : 'visibility'" :prepend-icon-cb="() => (showPassword = !showPassword)" :type="showPassword ? $gettext('text') : $gettext('password')"></v-text-field>
              </v-flex>
              <v-flex xs12 sm2 class="pl-1 pr-1 pt-2">
                <v-btn flat primary @click="() => postResetLink(user.email)">
                  Reset link &nbsp;
                  <v-icon>send</v-icon>
                </v-btn>
              </v-flex>
            </v-layout>
          </v-card-text>
        </v-card>

        <v-subheader>
          <translate>General Settings</translate>
        </v-subheader>
        <v-card class="grey lighten-4 elevation-0">
          <v-card-text>
            <v-layout row wrap>
              <v-flex xs12 sm6>
                <v-switch value :input-value="user.rights.survey_create" @change="(value) => setUserProp({path: 'rights.survey_create', value})" :label="$gettext('Allow create surveys')" color="indigo" hide-details></v-switch>
              </v-flex>
              <v-flex xs12 sm6>
                <v-switch value :input-value="user.settings.receive_digest" @change="(value) => setUserProp({path: 'settings.receive_digest', value})" :label="$gettext('Receive digest')" color="indigo" hide-details></v-switch>
              </v-flex>
              <v-flex xs12 sm6 v-if="feedbackInboxEnabled">
                <v-switch value :input-value=" user.rights.enable_feedback_inbox_for_user " @change="(value)=> setUserProp({path: 'rights.enable_feedback_inbox_for_user', value})" :label="$gettext('Enable feedback inbox for user')" hide-details color="indigo"></v-switch>
              </v-flex>
              <v-flex xs12 sm6>
                <v-switch value :input-value="user.organization_admin" @change="(value) => setUserProp({path: 'organization_admin', value})" :label="$gettext('Organization admin')" color="red" hide-details></v-switch>
              </v-flex>
            </v-layout>
          </v-card-text>
        </v-card>

        <v-subheader v-if="feedbackInboxEnabled && user.rights && user.rights.enable_feedback_inbox_for_user" v-translate>Inbox Settings</v-subheader>
        <v-card v-if="feedbackInboxEnabled && user.rights && user.rights.enable_feedback_inbox_for_user" class="grey lighten-4 elevation-0">
          <v-card-text>
            <translate>Fill inbox with</translate>
            <v-radio-group v-model="inboxMode">
              <v-radio :label="$gettext('All feedback')" value="all"></v-radio>
              <v-radio :label="$gettext('Only feedback assigned to user group via notifications')" value="group_assigned"></v-radio>
            </v-radio-group>

            <span v-if="inboxMode == 'group_assigned'">
              <translate>Select groups this user belongs to</translate>

              <v-flex xs12 sm6>
                <v-select :items="userGroups" v-model="userInboxGroups" multiple item-text="name" item-value="_id" max-height="400" hint="Pick your favorite states"></v-select>
              </v-flex>
            </span>
            <v-switch :input-value="!hideFullProfiles" @change="(value) => setUserProp({path: 'rights.inbox_settings.hide_full_profiles', value: !value})" :label="$gettext('Show the full feedback history of a contact')" hide-details color="indigo"></v-switch>

          </v-card-text>
        </v-card>

        <v-subheader>
          <translate>Rights to groups</translate>
        </v-subheader>
        <v-card class="grey lighten-4 elevation-0 pa-3">
          <ChannelTree :selected="user.rights.devicegroups" :channel-tree="channelTree" selection-mode="group" :on-change="(value) => setUserProp({path: 'rights.devicegroups', value})" :start-collapsed="true" />
        </v-card>

        <div>
          <v-subheader>
            <translate>REST API Keys</translate>
          </v-subheader>
          <p><translate>API keys are granted on a per-user basis. The resources the key can access are equivalent to user rights</translate>. <translate translate-comment="Used in 'See the API documentation for more details'">See the</translate>
            <a href="https://api.feedbackly.com/doc" target="_blank"><translate translate-comment="Used in 'See the API documentation for more details'">API documentation</translate></a> <translate translate-comment="Used in 'See the API documentation for more details'">for more details</translate>.
          </p>

          <v-flex class="grey lighten-4 pa-3">
            <v-layout v-for="(apiKey,i) in apiKeys" :key="i" align-center>
              <v-text-field :id="apiKey._id" :value="apiKey.jwt" />
              <v-btn round outline :color="apiKey.revoked ? 'grey': 'red'" dark @click="() => revokeApiKey({id: apiKey._id, revoke: !apiKey.revoked})">
                <translate v-if="apiKey.revoked == true">Unrevoke</translate>
                <translate v-else>Revoke</translate>

              </v-btn>
            </v-layout>
            <v-btn round :dark="restApiEnabled" small :disabled="!restApiEnabled" color="primary" class="elevation-0" @click="generateApiKey">
              <v-icon dark>add</v-icon> &nbsp;
              <translate v-if="restApiEnabled">Add API Key for user</translate>
              <translate v-else>Upgrade your plan to use the API</translate>
            </v-btn>
          </v-flex>
        </div>
      </v-card-text>
    </v-card>
    <v-card v-else class="elevation-0 ml-1">
      <v-card-text v-translate>
        Select a user or add a new one.
      </v-card-text>
    </v-card>
    <span style="display:none">
      <translate>New User</translate>
      <translate>Dashboard language</translate>
      <translate>User name</translate>
      <translate>Email</translate>
      <translate>New password</translate>
      <translate>At least 8 characters</translate>
      <translate>text</translate>
      <translate>password</translate>
      <translate>Allow create surveys</translate>
      <translate>Receive digest</translate>
      <translate>Enable feedback inbox for user</translate>
      <translate>Organization admin</translate>
      <translate>All feedback</translate>
      <translate>Only feedback assigned to user group via notifications</translate>
      <translate>Show the full feedback history of a contact</translate>
    </span>

    <v-dialog v-model="showDeleteDialog" max-width="290">
      <v-card>
        <v-card-title class="headline" v-translate>Delete user from Organization ? </v-card-title>
        <v-card-text v-translate>This action cannot be undone.</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click.native="dialog = false">Cancel</v-btn>
          <v-btn color="red darken-1" flat @click="() => deleteUserOk()">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<script>
import { date } from "../../utils/filters";
import ChannelTree from "../../components/ChannelTree";
import { get } from "lodash";
export default {
  name: "UserEdit",
  props: [
    "user",
    "saveUser",
    "setUserProp",
    "channelTree",
    "saving",
    "dashboardLanguages",
    "postResetLink",
    "userGroups",
    "feedbackInboxEnabled",
    "restApiEnabled",
    "apiKeys",
    "generateApiKey",
    "revokeApiKey",
    "addUser",
    "deleteUser"
  ],
  filters: {
    date
  },
  data() {
    return {
      showPassword: false,
      showDeleteDialog: false
    };
  },

  computed: {
    adminRoute() {
      return this.$route.name.startsWith("admin");
    },
    userInboxGroups: {
      get() {
        return get(this, "user.rights.inbox_settings.user_groups") || [];
      },
      set(value, old) {
        const newArray = this.userInboxGroups;
        this.setUserProp({ path: "rights.inbox_settings.user_groups", value });
      }
    },
    hideFullProfiles() {
      return get(this.user, "rights.inbox_settings.hide_full_profiles");
    },
    inboxMode: {
      get() {
        return get(this, "user.rights.inbox_settings.mode") || "all";
      },
      set(value) {
        this.setUserProp({ path: "rights.inbox_settings.mode", value });
      }
    }
  },
  methods: {
    deleteUserPrompt(){
      this.$set(this, 'showDeleteDialog', true)
    },
    deleteUserOk(){
      this.$set(this, 'showDeleteDialog', false)
      this.deleteUser()
    }
  },
  components: { ChannelTree }
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
