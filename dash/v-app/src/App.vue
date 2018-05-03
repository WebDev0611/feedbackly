<template>
  <v-app :class="routeName">
    <main>
      <NavBar :user-rights="userDetails" class="no-print" />
      <v-container fluid class="inline-block no-print" style="margin: 0">
        <router-view></router-view>
        <LogInDialog />
      </v-container>
    </main>
    <v-snackbar :timeout="uiMessage.timeout" top right multi-line :color="uiMessage.color" v-model="showSnack" class="no-print">
      {{ uiMessage.text }}
      <v-btn dark flat @click.native="showSnack = false">
        <v-icon>close</v-icon>
      </v-btn>
    </v-snackbar>
    <InvoiceModal v-if="printInvoice" class="print-content show-print" :charge="printInvoice.charge" :billing-info="printInvoice.billingInfo" />
  </v-app>
</template>


<script>
import Vue from "vue";
import { mapState, mapActions, mapMutations } from "vuex";
import {
  PING_LOGIN,
  SET_LOGIN_STATE,
  SET_FORWARD_TO,
  SET_UI_MESSAGE,
  GET_USER_DETAILS
} from "./constants/main";
import NavBar from "./components/NavBar";
import LogInDialog from "./modules/login-signup/LoginDialog";
import InvoiceModal from "./components/InvoiceModal";
import getCookieByName from "@/lib/cookie";
import { setup } from "@/lib/intercom";
const getAuthCookie = () => getCookieByName("jwt");

const requiredUserDetailFields = [
  "availableFeatures",
  "enable_feedback_inbox_for_user",
  "organization_admin",
  "survey_create",
  "segment",
  "locale",
  "email",
  "system_admin",
  "deviceTree"
];

export default {
  components: { LogInDialog, NavBar, Intercom, InvoiceModal },
  data() {
    return {
      showSnack: false
    };
  },
  computed: {
    ...mapState({
      uiMessage: state => state.uiMessage,
      userDetails: state => state.userDetails,
      printInvoice: state => state.printInvoice
    }),
    ...mapState("route", {
      routeName: state => state.name
    })
  },
  watch: {
    uiMessage() {
      if (this.uiMessage.show && this.uiMessage.text && this.uiMessage.text.length > 2)
        this.$set(this, "showSnack", true);
    }
  },
  methods: {
    ...mapActions([PING_LOGIN, GET_USER_DETAILS]),
    ...mapMutations([SET_LOGIN_STATE, SET_FORWARD_TO, SET_UI_MESSAGE])
  },
  created() {
    const authorizedOnLoad = getAuthCookie().length > 0;
    if (authorizedOnLoad === false) {
      this.SET_LOGIN_STATE(false);
      const route = this.$route.fullPath;
      if (route.indexOf("/login") === -1 && oute.indexOf("/signup") === -1) {
        this.SET_FORWARD_TO(route);
        this.$router.push("/login");
      }
    } else this.SET_LOGIN_STATE(true);
    this.PING_LOGIN();

    setInterval(() => {
      if (getAuthCookie().length > 0) this.PING_LOGIN();
      else this.SET_LOGIN_STATE(false);
    }, 25 * 1000);

    this[GET_USER_DETAILS]({ fields: requiredUserDetailFields }).then(() => {
      setup(this.userDetails.email); // Intercom
      Vue.config.language = this.userDetails.locale;
    });
  }
};
</script>

<style lang="stylus">
@import './stylus/main';

body, .list__tile {
  font-weight: 300;
}

.side-menu {
  padding-bottom: 5px;
  padding-left: 3px;
}

.inline-block {
  display: inline-block;
}

.full-height {
  height: 100% !important;
}

#ux-disclaimer {
  background: teal;
  color: white;
  position: fixed;
  bottom: 0;
  width: 100vw;
  text-align: center;
  padding: 0.3em;
}

#ux-disclaimer .close {
  display: inline-block;
  background-color: white;
  border-radius: 100%;
  height: 17px;
  width: 17px;
  cursor: pointer;
}

#ux-disclaimer i {
  font-size: 1em !important;
  color: black;
}

.loginSignup, .loginSignup_forgot, .loginSignup_resetPassword, .loginSignup_signup {
  background: none;
  background-image: url('/images/scale-bg.png');
  background-position: bottom right;
  background-repeat: no-repeat;
  background-attachment: fixed;

  nav {
    display: none !important;
  }
}

#intercom-launcher {
  left: 20px !important;
  bottom: 5px !important;
}

#intercom-container .intercom-sheet {
  left: 0 !important;
}

#intercom-container .intercom-launcher-discovery-frame {
  left: 9px !important;
  bottom: 5px !important;
}

#intercom-container .intercom-gradient {
  display: none;
}

.intercom-launcher-badge-frame {
  left: 10px !important;
  bottom: 19px !important;
}

.intercom-notifications-frame {
  left: 16px !important;
  bottom: 78px !important;
}

#intercom-container .intercom-launcher-frame, #intercom-container .intercom-launcher-frame:active {
  left: 10px !important;
  bottom: 6px !important;
}

#intercom-container .intercom-app-launcher-enabled .intercom-messenger-frame {
  left: 20px !important;
}

.print-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  text-align: center;
  display: none;
}

.section-title {
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: 500;
  font-size: 1.15em;
}
</style>
