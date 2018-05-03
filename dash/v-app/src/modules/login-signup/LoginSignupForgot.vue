<template>
  <v-container>
    <v-layout row wrap justify-center>
      <v-flex xs12 sm10 md7 lg5 text-xs-center>
        <v-card>
          <v-card-text>
            <Logo />
            <v-form v-model="valid" class="pl-5 pr-5" v-if="!resetLinkSent">
              <p class="mt-3" v-translate>Enter your e-mail address and a password reset link will be e-mailed to you.</p>
              <transition name="show-error">
                <p v-if="resetLinkError" key="er" class="login-error red--text" v-translate>
                  The provided e-mail address could not be found from the database. Check your input and try again.
                </p>
              </transition>
              <v-text-field label="E-mail" :value="email" @input="value => SET_LOGIN_PROP({path: 'email', value})" required></v-text-field>
              <br>

              <v-btn class="teal white--text mt-4" @click="POST_RESET_LINK">
                <translate>Send a reset link</translate>
              </v-btn>
            </v-form>

            <div v-if="resetLinkSent" class="pa-5">
              <translate>We have sent a password reset link to</translate> {{ email }}. <br /> <br />
              <router-link to="/login"><translate>Sign in</translate></router-link>
            </div>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapActions, mapState, mapMutations } from "vuex";
import { NAMESPACE } from "./store";
import Logo from "./components/Logo";
import { SET_LOGIN_PROP, POST_RESET_LINK } from "./constants";

export default {
  data() {
    return {
      valid: true
    };
  },
  components: { Logo },
  computed: {
    ...mapState(NAMESPACE, {
      email: state => state.logIn.email,
      resetLinkError: state => state.logIn.resetLinkError,
      resetLinkSent: state => state.logIn.resetLinkSent
    })
  },
  methods: {
    ...mapMutations(NAMESPACE, [SET_LOGIN_PROP]),
    ...mapActions(NAMESPACE, [POST_RESET_LINK])
  },
  watch: {
    email() {
      this.SET_LOGIN_PROP({ path: "resetLinkError", value: false });
    }
  }
};
</script>

<style scoped>
.show-error-enter-active,
.show-error-leave-active {
  transition: opacity 0.5s;
}

.show-error-enter,
.show-error-leave-to {
  opacity: 0;
}
</style>
