<template>
  <v-container>
    <v-layout row wrap justify-center>
      <v-flex xs12 sm10 md7 lg5 text-xs-center>
        <v-card>
          <v-card-text>
            <Logo />

            <v-progress-circular v-if="loading" indeterminate v-bind:size="50" color="teal"></v-progress-circular>
            <div v-else>
              <div v-if="organizationDetails.email">
                <p class="mt-3" v-translate>Email confirmed. Continue the signup with entering a password. </p>
                  <p class="red--text">
                    &nbsp;
                    <span v-if="errors.length > 0">Password {{ errors.join(", ") }}</span>
                  </p>
                <v-form class="pl-5 pr-5">
                  <v-text-field label="Email" disabled :value="organizationDetails.email"></v-text-field>
                  <v-text-field label="Password" type="password" :value="organizationDetails.password" @input="value => SET_ORGANIZATION_PROP({path: 'password', value})"></v-text-field>
                  <v-text-field label="Re-enter password" type="password" v-model="confirmPassword"></v-text-field>
                </v-form>
                <div class="pb-4" style="position:relative">&nbsp;
                  <v-btn :disabled="passwordsDontMatch" :dark="!passwordsDontMatch" @click="() => SET_PHASE({phase: 2})" fab small class="primary float-right">
                    <v-icon dark>arrow_forward</v-icon>
                  </v-btn>
                </div>
              </div>
              <div v-else>
                <p v-translate>Something went wrong with the sign up.</p>
                <p v-translate>Please keep in mind that the verification link is only valid for a short period of time.
                </p>
                <translate>Please fill in the registration form again at</translate> <a href="https://www.feedbackly.com/sign-up">https://www.feedbackly.com/sign-up</a>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <span style="display:none">
      <translate>Email</translate>
      <translate>Password</translate>
      <translate>Re-enter password</translate>
    </span>
  </v-container>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import { intersection } from "lodash";
import { NAMESPACE } from "../store";
import { SET_PHASE, SET_ORGANIZATION_PROP } from "../constants";
import Logo from "../../login-signup/components/Logo";

export default {
  data() {
    return {
      confirmPassword: "",
      errors:[]
    };
  },
  components: { Logo },
  methods: {
    ...mapMutations(NAMESPACE, [SET_PHASE, SET_ORGANIZATION_PROP])
  },
  computed: {
    ...mapState(NAMESPACE, {
      organizationDetails: state => state.organizationDetails,
      loading: state => state.loading
    }),
    passwordsDontMatch: {
      get() {
          if(this.confirmPassword.length < 5) return true;
          const errors = []
          if(this.organizationDetails.password.length < 7) errors.push(this.$gettext('must be over 6 characters'))
          if(this.organizationDetails.password === this.organizationDetails.password.toUpperCase() ||
          this.organizationDetails.password === this.organizationDetails.password.toLowerCase()) errors.push(this.$gettext('must contain both upper-and lowercase characters'))
          if(intersection(this.organizationDetails.password.split(""), "1234567890".split("")).length === 0) errors.push(this.$gettext('must contain at least 1 number'))
          if(this.organizationDetails.password !== this.confirmPassword) errors.push(this.$gettext('must match confirmation field'))

          this.$set(this, 'errors', errors);

          return errors.length > 0

      },
      set() {}
    }
  }
};
</script>

<style lang="stylus" scoped>
.float {
  &-right {
    float: right;
  }

  &-left {
    float: left;
  }
}
</style>
