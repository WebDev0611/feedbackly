<template>
  <v-layout class="pt-2">
    <v-flex xs12>
      <h5 v-translate>User groups</h5>
      <p v-translate>User groups are used to assign feedback to different users for processing. Use this in conjunction with notifications and feedback inbox.</p>

      <p class="subheader"  v-translate>User groups</p>
      <v-flex class="pa-3 grey lighten-4" xs12>
        <v-progress-linear v-if="loading" color="teal" :indeterminate="true"></v-progress-linear>
        <v-chip v-if="!loading" v-for="(group, i) in userGroups" color="teal" close text-color="white" :key="i" @input="() => close(group._id || group.newId)">
          <v-avatar>
            <v-icon>account_circle</v-icon>
          </v-avatar>
          {{ group.name }}
        </v-chip>

      </v-flex>
      <p class="subheader" v-translate>Add user groups</p>

      <v-flex class="pa-3 grey lighten-4">
        <v-layout>
          <v-text-field label="Add a new user group" v-model="newUserGroup" color="teal" />
          <v-btn fab small color="indigo" :outline="newUserGroup.length !== 0" :disabled="newUserGroup.length === 0" @click="addUserGroup">
            <v-icon>add</v-icon>
          </v-btn>
        </v-layout>
      </v-flex>
    </v-flex>

    <v-dialog v-model="dialog" persistent max-width="400">
      <v-card v-if="deleteGroupId">
        <v-card-title class="headline" v-translate>Confirm user group removal</v-card-title>
        <v-card-text>
          <translate>Removing user group</translate>
          <strong>{{ deleteGroupName }}</strong>. <translate>This function cannot be undone.</translate></v-card-text>
        <v-card-actions>
          <v-btn flat @click.native="dialog = false" v-translate>Cancel</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="red" flat @click="removeGroup()" v-translate>Remove</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-layout>
</template>

<script>
import { mapMutations, mapState, mapActions } from "vuex";
import { find } from "lodash";
import { NAMESPACE } from "./store";
import { SET_ORGANIZATION_PROP, PUT_ORGANIZATION } from "./constants";
export default {
  data() {
    return {
      dialog: false,
      deleteGroupId: null,
      newUserGroup: ""
    };
  },
  computed: {
    ...mapState(NAMESPACE, {
      userGroups: state => state.selectedOrganization.user_groups,
      loading: state => state.loading
    }),
    deleteGroupName() {
      const group =
        find(this.userGroups, { _id: this.deleteGroupId }) ||
        find(this.userGroups, { newId: this.deleteGroupId });
      if (this.deleteGroupId) return group.name;
      else return "";
    }
  },
  methods: {
    ...mapMutations(NAMESPACE, [SET_ORGANIZATION_PROP]),
    ...mapActions(NAMESPACE, [PUT_ORGANIZATION]),
    close(id) {
      this.$set(this, "deleteGroupId", id);
      this.$set(this, "dialog", true);
    },
    removeGroup() {
      const newUserGroups = this.userGroups.filter(
        g => g._id != this.deleteGroupId && g.newId != this.deleteGroupId
      );
      this.$set(this, "dialog", false);
      this.$set(this, "deleteGroupId", undefined);
      this[SET_ORGANIZATION_PROP]({ path: "user_groups", value: newUserGroups });
      this[PUT_ORGANIZATION]();
    },
    addUserGroup() {
      const newGroup = { name: this.newUserGroup, newId: Date.now() };
      this.$set(this, "newUserGroup", "");
      this[SET_ORGANIZATION_PROP]({ path: "user_groups", value: [...this.userGroups, newGroup] });
      this[PUT_ORGANIZATION]();
    }
  }
};
</script>

<style>

</style>
