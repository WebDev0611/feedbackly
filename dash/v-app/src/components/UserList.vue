<template>
  <v-card class="elevation-0">
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
</template>

<script>
import { get } from "lodash";

export default {
  name: "UserList",
  props: ["users", "selectUser", "activeUser", "organizationId"],
  data() {
    return {
      filter: ""
    };
  },
  computed: {
    userList() {
      return (this.users || []).filter(
        u => u.displayname.toLowerCase().indexOf(this.filter.toLowerCase()) > -1
      );
    }
  },
  methods: {
    selectedClass(id) {
      return (get(this, "activeUser._id") || "") === id ? "grey lighten-3" : "";
    },
  }
};
</script>

<style>

</style>
