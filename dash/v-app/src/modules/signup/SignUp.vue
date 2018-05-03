<template>
  <div>
    <transition name="fade" mode="out-in">
      <Phase1 v-if="currentPhase == 1" class="phase1" />
      <Phase2 v-if="currentPhase == 2" class="phase2" />
      <Phase3 v-if="currentPhase == 3" class="phase3" />

    </transition>
  </div>
</template>


<script>
import { mapState, mapActions, mapMutations } from "vuex";
import { NAMESPACE } from "./store";
import { GET_SIGNUP_INFO, SET_ORGANIZATION_PROP } from "./constants";

import Phase1 from "./components/Phase1";
import Phase2 from "./components/Phase2";
import Phase3 from "./components/Phase3";

export default {
  computed: {
    ...mapState(NAMESPACE, ["currentPhase"])
  },
  methods: {
    ...mapActions(NAMESPACE, [GET_SIGNUP_INFO]),
    ...mapMutations(NAMESPACE, [SET_ORGANIZATION_PROP])
  },
  components: {
    Phase1,
    Phase2,
    Phase3
  },
  created() {
    const token = this.$route.params.token;
    this[GET_SIGNUP_INFO]({ token });
    this[SET_ORGANIZATION_PROP]({ path: "initialToken", value: token });
  }
};
</script>

<style lang="stylus">
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s;
}

.fade-enter, .fade-leave-active {
  opacity: 0;
}

.fade-enter {
  transform: translateX(40vw);
}

.fade-leave-active {
  transform: translateX(-40vw);
}

.fade-enter.phase1 {
  transform: translateX(-40vw);
}
</style>
