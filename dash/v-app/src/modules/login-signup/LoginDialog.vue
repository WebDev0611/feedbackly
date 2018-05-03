<template>
  <transition name="fade">
    <div class="overlayer" v-if="show && innerShow">
      <LoginSignupMain class="mt-5" :dialog="true" />
    </div>
  </transition>
</template>

<script>
import { mapState } from "vuex";
import LoginSignupMain from "./LoginSignupMain";
export default {
  components: { LoginSignupMain },
  data() {
    return {
      innerShow: true
    };
  },
  computed: {
    ...mapState({
      show: state => !state.userLoggedIn
    }),
    ...mapState("route", {
      route: state => state.name
    })
  },
  methods: {
    hideIfLoginScreen() {
      if ((this.route || "").indexOf("loginSignup") > -1) {
        this.$set(this, "innerShow", false);
      } else this.$set(this, "innerShow", true);
    }
  },
  watch: {
    $route: "hideIfLoginScreen"
  },
  created() {
    this.hideIfLoginScreen();
  }
};
</script>

<style lang="stylus" scoped>
.overlayer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vw;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 9000;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter, .fade-leave-to { /* .fade-leave-active below version 2.1.8 */
  opacity: 0;
}
</style>
