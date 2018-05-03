  <template>
  <v-container>
    <v-layout row wrap justify-center>
      <v-flex xs12 sm10 md7 lg5 text-xs-center>
        <v-card>
          <v-card-text>
            <Logo />
            <div v-if="!signupSuccess">
              <p class="mt-3">
                <translate>You have selected the</translate> {{selectedPlanName}}.
              </p>
              <p>
                <v-progress-circular v-if="loading" indeterminate v-bind:size="50" color="teal"></v-progress-circular>
                <v-btn v-else dark color="teal" @click="POST_SIGNUP" v-translate>Confirm account creation</v-btn>
              </p>
              <div class="pb-4" style="position:relative">&nbsp;
                <v-btn @click="() => SET_PHASE({phase: 2})" fab small class="float-left">
                  <v-icon>arrow_back</v-icon>
                </v-btn>
              </div>
            </div>
            <div v-else class="pa-3">
              <popup></popup>
              <h5 v-translate>SignUp completed successfully</h5>
              <router-link :to="{name: 'loginSignup'}"><translate>Click here to log in to Feedbackly</translate></router-link>
            </div>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapMutations, mapState, mapActions } from "vuex";
import popup from './Popup.vue';
import { find, get } from "lodash";
import { NAMESPACE } from "../store";
import { SET_PHASE, POST_SIGNUP, SET_LOADING_STATE, SET_ORGANIZATION_PROP } from "../constants";
import { plans } from "@/constants/subscription-plans";

import Logo from "../../login-signup/components/Logo";

export default {
  components: { Logo, popup },
  data() {
    return {
      plans,
      dialog: true
    };
  },
  methods: {
    ...mapMutations(NAMESPACE, [SET_PHASE, SET_LOADING_STATE, SET_ORGANIZATION_PROP]),
    ...mapActions(NAMESPACE, [POST_SIGNUP])
  },
  computed: {
    ...mapState(NAMESPACE, {
      selectedPlan: state => get(state, "organizationDetails.plan"),
      loading: state => state.loading,
      signupSuccess: state => state.signupSuccess,
    }),
    selectedPlanName() {
      return find(this.plans, { id: this.selectedPlan }).name;
    }
  }
};
</script>

<style scoped lang="stylus">
.float {
  &-right {
    float: right;
  }

  &-left {
    float: left;
  }
}
</style>
