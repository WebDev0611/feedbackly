<template>
  <v-container>
    <v-layout row wrap justify-center>
      <v-flex xs12 sm10 md7 lg5 text-xs-center>
        <v-card>
          <v-card-text>
            <Logo />
            <p v-translate>Enter a new password for your account</p>
            <p class="red--text">&nbsp; {{ error }}</p>
            <v-text-field :label="$gettext('New password')" v-model="password1" required type="password"></v-text-field>
            <v-text-field :label="$gettext('Confirm password')" v-model="password2" required type="password"></v-text-field>

            <v-btn color="teal" dark @click="validate">
              <translate>Change password</translate>
            </v-btn>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapActions } from "vuex";
import { intersection, get } from "lodash";
import Logo from "./components/Logo";
import { POST_NEW_PASSWORD } from "./constants";
import { NAMESPACE } from "./store";
export default {
  components: { Logo },
  data() {
    return {
      password1: "",
      password2: "",
      error: null
    };
  },

  methods: {
    ...mapActions(NAMESPACE, [POST_NEW_PASSWORD]),
    validate() {
      const check = () => {
        if (this.password1 !== this.password2) return "Passwords must match";
        if (this.password1.length < 7) return "Password must be at least 7 characters long";
        if (this.password1.toLowerCase() === this.password1) return "Password must contain at least one capital letter";
        if (intersection(this.password1.split(""), "1234567890".split("")).length === 0)
          return "Password must contain at least 1 number";
        return "";
      };

      this.error = check();
      if (this.error === "")
        this[POST_NEW_PASSWORD]({ password: this.password1, token: get(this, "$route.params.token") });
    }
  }
};
</script>

<style>

</style>
