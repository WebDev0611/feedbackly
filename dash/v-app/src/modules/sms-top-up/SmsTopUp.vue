<template>
  <v-layout row wrap justify-center>
    <v-flex xs12 sm6 md3>
      <v-card>
        <v-card-text>
          <h6 v-translate>Top up SMS account</h6>

          <span class="subheader" style="display:inline" v-translate>Current SMS balance:</span>
          <span v-if="!loading">
            <span v-if="balance.balance">
              {{ balance.balance | money }}€
            </span>
            <span v-else>
              <br />
              <translate>There's no balance on your account.</translate>
            </span>
            <span v-if="balance.segment === 'TEST' || balance.segment === 'SOLUTION_SALES'">
              <br />
              <translate>For invoicing purposes, solutions customers are asked to contact Feedbackly to top up their account.</translate>
              <translate>You can do it via the chat or by sending email to </translate>
              <a href="mailto:support@feedbackly.com">support@feedbackly.com</a>
            </span>
          </span>
          <v-progress-circular v-else indeterminate color="teal"></v-progress-circular>

          <p v-if="balance.segment === 'SELF_SIGNUP'">
            <span class="subheader">Top up </span>
            <v-select class="ml-3" :value="charge" @change="CHANGE_CHARGE" style="max-width: 150px" :items="items"
            :label="$gettext('Select amount')" single-line auto append-icon="euro_symbol" hide-details></v-select>
          </p>
        </v-card-text>
        <v-card-actions class="border-top" v-if="balance.segment === 'SELF_SIGNUP'">
          <v-btn color="primary" :disabled="charge==0 || loading" @click="POST_TOP_UP">
            <translate>Top up </translate> &nbsp; {{ charge > 0 ? ` with ${charge}€` : ''}}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
    <span style="display:none;">
      <translate>Select amount</translate>
    </span>
  </v-layout>
</template>

<script>
import { mapState, mapActions, mapMutations } from "vuex";
import { NAMESPACE } from "./store";
import { CHANGE_CHARGE, GET_BALANCE, POST_TOP_UP } from "./constants";
import { SET_UI_MESSAGE } from "@/constants/main";
export default {
  mounted() {
    this[GET_BALANCE]();
  },
  data() {
    return {
      items: [5, 10, 20, 30, 50, 100, 200, 300, 400, 500]
    };
  },
  computed: {
    ...mapState(NAMESPACE, ["balance", "loading", "charge"])
  },
  methods: {
    ...mapMutations([SET_UI_MESSAGE]),
    ...mapMutations(NAMESPACE, [CHANGE_CHARGE]),
    ...mapActions(NAMESPACE, [GET_BALANCE, POST_TOP_UP])
  },
  filters: {
    money: input => ((input || "") + "").split(".").join(",")
  }
};
</script>

<style lang="stylus" scoped>
.border-top {
  border-top: 1px solid #dcdcdc;
}
</style>
