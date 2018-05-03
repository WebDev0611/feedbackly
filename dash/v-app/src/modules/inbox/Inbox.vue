<template>

  <v-container fill-height :style="`max-width: unset; padding: unset; max-height: ${height};`" ref="container">
    <v-layout row wrap v-if="inboxEnabled">
      <v-flex xs12 sm4 class="scrollable">
        <v-checkbox :label="$gettext('Include already processed feedback')" light v-model="processed" @change="setProcessedAndFetch"></v-checkbox>
        <v-card>
          <v-list v-for="feedback in INBOX_LIST" v-bind:key="feedback.id">
            <router-link :to="{ path: `/inbox/${feedback.id}`}">
              <v-list-tile v-model="selectedId === feedback.id" avatar>
                <v-list-tile-content>
                  <v-list-tile-title v-if=" feedback.contact && feedback.contact.email" v-text="feedback.contact.email" />
                  <v-list-tile-title v-else-if="feedback.contact && feedback.contact.phone" v-text="feedback.contact.phone" />
                  <v-list-tile-title v-else v-translate>Feedback</v-list-tile-title>
                  <v-list-tile-sub-title>
                    {{ feedback.created_at | date }} {{ feedback.channel_name }} {{ feedback.survey_name }}
                  </v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action>
                  <div v-if="!feedback.processed" class="unprocessed">&nbsp;</div>
                </v-list-tile-action>
              </v-list-tile>
            </router-link>
          </v-list>
        </v-card>
        <v-spacer></v-spacer>
      </v-flex>
      <v-flex xs12 sm8>
        <router-view :parent-height="height"></router-view>
      </v-flex>
    </v-layout>
    <v-layout v-if="inboxEnabled == false">
      <InboxTeaser :is-organization-admin="isOrganizationAdmin" />
    </v-layout>
    <span style="display:none">
      <translate>Include already processed feedback</translate>
    </span>
  </v-container>
</template>
<script>
// @flow

import { mapActions, mapState, mapMutations } from "vuex";
import { get } from "lodash";
import detailsComponent from "./Inbox-details";
import InboxTeaser from "./InboxTeaser";
import { date } from "@/utils/filters";
import FEATURES from "@/constants/features";

import { NAMESPACE, FETCH_INBOX_LIST, SET_FETCH_OPTS, SET_INBOX_LIST, SET_INBOX_DETAILS } from "./constants";

export default {
  components: {
    detailsComponent,
    InboxTeaser
  },
  computed: {
    ...mapState(NAMESPACE, {
      INBOX_DETAILS: state => state.inboxDetails,
      INBOX_LIST: state => state.inboxList,
      processed: state => state.fetchOptions.processed
    }),
    ...mapState("route", {
      selectedId: state => state.params.clientId
    }),
    ...mapState({
      inboxEnabled: state => {
        if (get(state, "userDetails.availableFeatures")) {
          return (get(state, "userDetails.availableFeatures") || []).indexOf(FEATURES.FEEDBACK_INBOX) > -1;
        } else return undefined;
      },
      isOrganizationAdmin: state => get(state, "userDetails.organization_admin")
    })
  },
  data: () => ({ height: "97vh" }),
  methods: {
    ...mapActions(NAMESPACE, {
      FETCH_INBOX_LIST
    }),
    ...mapMutations(NAMESPACE, [SET_FETCH_OPTS, SET_INBOX_LIST, SET_INBOX_DETAILS]),
    setProcessedAndFetch(value) {
      this[SET_FETCH_OPTS]({ path: "processed", value });
      this.FETCH_INBOX_LIST();
    }
  },
  filters: {
    date
  },
  watch: {
    inboxEnabled() {
      if (this.inboxEnabled === true) this.FETCH_INBOX_LIST();
    }
  },
  created() {
    if (this.inboxEnabled === true) this.FETCH_INBOX_LIST();
  },
  beforeDestroy() {
    this[SET_INBOX_DETAILS]({});
    this[SET_INBOX_LIST]([]);
  }
};
</script>

<style scoped lang="stylus">
a {
  text-decoration: none;
}

.unprocessed {
  height: 10px;
  width: 10px;
  background-color: red;
  border-radius: 100%;
}

.router-link-exact-active, .router-link-active {
  li {
    background-color: rgb(243, 243, 243);
  }

  .list__tile--active, .list__tile__title {
    color: initial;
  }
}

ul.list {
  padding-top: 0;
  padding-bottom: 0;
}

.scrollable {
  overflow-y: scroll;
}
</style>
