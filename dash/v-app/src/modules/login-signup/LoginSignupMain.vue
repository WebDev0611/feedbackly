<template>
  <v-container>
    <v-layout row wrap justify-center>
      <v-flex xs12 sm10 md7 lg5 text-xs-center>
        <v-card>
          <v-card-text>
            <Logo />
            <p class="mt-3" v-translate>Sign in</p>
            <transition name="show-error">
              <p v-if="failed" key="er" class="login-error red--text" v-translate>Sign-in failed. Check your e-mail and password.</p>
            </transition>
            <v-form v-model="valid" class="pl-5 pr-5">
              <v-text-field label="E-mail" :value="email" @input="value => SET_LOGIN_PROP({path: 'email', value})" required @keyup.enter="() => POST_LOGIN({dialog})"></v-text-field>
              <v-text-field label="Password" :value="password" @input="value => SET_LOGIN_PROP({path: 'password', value})" type="password" required @keyup.enter="() => POST_LOGIN({dialog})"></v-text-field>

              <router-link v-if="dialog !== true " class="forgot" to="/login/forgot"><translate>Forgot your password?</translate></router-link>

              <br>

              <v-btn class="teal white--text mt-4" @click="() => POST_LOGIN({dialog})" v-translate>Log in</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapMutations, mapState, mapActions } from "vuex";
import { SET_LOGIN_PROP, POST_LOGIN, LOGIN_FAIL } from "./constants";
import { NAMESPACE } from "./store";
import Logo from "./components/Logo";
export default {
  components: { Logo },
  props: ["dialog"],
  data() {
    return { valid: true };
  },
  computed: {
    ...mapState(NAMESPACE, {
      email: state => state.logIn.email,
      password: state => state.logIn.password,
      rememberMe: state => state.logIn.rememberMe,
      failed: state => state.logIn.failed
    })
  },
  methods: {
    ...mapMutations(NAMESPACE, [SET_LOGIN_PROP, LOGIN_FAIL]),
    ...mapActions(NAMESPACE, [POST_LOGIN])
  },
  watch: {
    password() {
      this.LOGIN_FAIL(false);
    }
  }
};
</script>

<style lang="stylus" scoped>
h1, h2, h3, h4, h5, h6 {
  font-weight: 400;
}

.forgot {
  float: right;
}

.login-error {
  font-style: italic;
}
</style>
