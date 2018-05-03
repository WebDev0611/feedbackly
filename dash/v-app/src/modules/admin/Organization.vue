<template>
  <v-tabs light fixed icons centered v-model="selectedRoute">
    <v-tabs-bar class="grey lighten-3">
      <v-tabs-slider class="teal"></v-tabs-slider>
      <v-tabs-item v-for="(tab, i) in tabs" :key="tab.route" :href="'#'+tab.route">
        <v-icon>{{tab.icon}}</v-icon>
        {{tab.label}}
      </v-tabs-item>
    </v-tabs-bar>
    <v-tabs-items>
      <v-tabs-content v-for="(tab, i) in tabs" :key="tab.route" :id="tab.route">
        <router-view v-if="tab.route.indexOf(selectedRoute) > -1"></router-view>
      </v-tabs-content>
    </v-tabs-items>
  </v-tabs>
</template>

<script>
/* eslint-disable */
import { mapState, mapActions } from 'vuex'
import {NAMESPACE} from './store';
import { GET_ORGANIZATION_BY_ID, GET_SMS_BALANCE } from './constants';

export default {
    name: 'AdminOrganization',
    created: function(){
      this[GET_ORGANIZATION_BY_ID]({payload: {id: this.getId()}})
      .then(() => this[GET_SMS_BALANCE]())
    },
    methods: {
      getId: function(){ return this.$store.state.route.params.id},
      ...mapActions(NAMESPACE, [GET_ORGANIZATION_BY_ID, GET_SMS_BALANCE]),
    },
    computed: {
      ...mapState(NAMESPACE, [
        'activeOrganization'
      ]),

      ...mapState('route', {
        route: state => state.name
      }),

      selectedRoute: {
        get(){ 
          return this.route.split(".").slice(0,2).join(".")
        },
        set(e){ 
          this.$router.push({name: e}) }
      }

    },
    data(){
      return {
        tabs: [
          {icon: "location_city", route: 'admin.editOrganization', label: this.$gettext('Details')},
          {icon: "people", route: 'admin.Users', label: this.$gettext("Users")},
          {icon: "store", route: 'admin.Channels', label: this.$gettext("Channels")},
          {icon: "view_week", route: 'admin.Channelgroups', label: this.$gettext("Channelgroups")}
        ]
      }
    },

    beforeRouteEnter (to, from, next) {
      window.initialRouteTime = window.initialRoute == undefined ? Date.now() : window.initialRoute;
      if(from.name == null){
        next()
      }
      next()
    },

    beforeRouteUpdate(to, from, next){
      if(Date.now()-window.initialRouteTime < 500) return next(false)
      next()
    }


}

</script>