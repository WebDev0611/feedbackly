<template>

</template>

<script>
  import { mapState, mapActions, mapMutations } from "vuex";
  import { NAMESPACE } from "./store";
  import { GET_REFERRAL_STATUS, SET_REFERRAL_STATUS } from "./constants";
  export default {
    name: "referral-status",
    data() {
      return {};
    },
    mounted() {
      this[GET_REFERRAL_STATUS]();
    },
    methods: {
      ...mapActions(NAMESPACE, [GET_REFERRAL_STATUS])
    },
  }
</script>

<style scoped>

</style>
