<template>
  <v-tabs light fixed icons centered v-model="selectedRoute">
    <v-tabs-bar class="grey lighten-3">
      <v-tabs-slider class="teal"></v-tabs-slider>
      <v-tabs-item v-for="tab in tabs" :key="tab.route" :href="'#'+tab.route">
        <v-icon>{{tab.icon}}</v-icon>
        {{tab.label}}
      </v-tabs-item>
    </v-tabs-bar>
    <v-tabs-items>
      <v-tabs-content v-for="tab in tabs" :key="tab.route" :id="tab.route">
        <router-view v-if="tab.route.indexOf(selectedRoute) > -1"></router-view>
      </v-tabs-content>
    </v-tabs-items>
  </v-tabs>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { NAMESPACE } from "./store";
import { GET_ORGANIZATION } from "./constants";

export default {
  name: "Organization",
  data() {
    return {

    };
  },
  methods: {
    ...mapActions(NAMESPACE, [GET_ORGANIZATION])
  },
  computed: {
    ...mapState("route", {
      route: state => state.name
    }),
    selectedRoute: {
      get() {
        const returnable = this.route
          .split(".")
          .slice(0, 2)
          .join(".");
        return returnable;
      },
      set(e) {
        this.$router.push({ name: e });
      }
    },
    tabs(){
      return [
        {
          icon: "location_city",
          route: "organization.settings",
          label: this.$gettext("Settings")
        },
        { icon: "account_circle", route: "organization.users", label: this.$gettext("Users") },
        { icon: "group", route: "organization.user-groups", label: this.$gettext("User groups") },

        {
          icon: "format_paint",
          route: "organization.visual-appearance",
          label: this.$gettext("Logo & Visuals")
        }
      ]
    }
  },
  created() {
    this[GET_ORGANIZATION]();
  },
  beforeRouteEnter(to, from, next) {
    window.initialRouteTime = window.initialRoute == undefined ? Date.now() : window.initialRoute;
    if (from.name == null) {
      next();
    }
    next();
  },

  beforeRouteUpdate(to, from, next) {
    if (Date.now() - window.initialRouteTime < 500) return next(false);
    next();
  }
};
</script>
