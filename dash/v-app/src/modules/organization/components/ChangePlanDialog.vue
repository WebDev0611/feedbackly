<template>
  <v-dialog v-model="show" persistent max-width="500px">
    <v-card >
      <v-card-title class="headline">
        <span v-if="payload.type === 'DOWNGRADE'" v-translate>Confirm plan downgrade</span>
        <span v-if="payload.type === 'CANCEL_DOWNGRADE'" v-translate>Confirm plan downgrade cancellation</span>
        <span v-if="payload.type === 'UPGRADE'" v-translate>Confirm plan upgrade</span>

      </v-card-title>
      <v-card-text v-if="!loading">
        <p v-if="payload.type === 'UPGRADE'" v-translate>
          Please confirm plan upgrade.
        </p>
        <p v-if="payload.type === 'DOWNGRADE'" v-translate>
          Please confirm plan downgrade. Your current plan will stay active until the end of your billing cycle and the downgraded plan will be activated afterwards automatically.
        </p>
        <p v-if="payload.type === 'CANCEL_DOWNGRADE'" v-translate>
          Please confirm downgrade cancellation. Your previously selected downgrade will be cancelled and you will stay on your currently active plan.
        </p>
      </v-card-text>

      <div class="text-xs-center pa-3" v-if="loading">
        <v-progress-circular indeterminate v-bind:size="50" color="primary"></v-progress-circular>
      </div>

      <v-card-actions v-if="!loading">
        <v-btn color="primary" @click="() => changePlanAction(this.payload.id)" v-translate>Confirm</v-btn>
        <v-btn flat @click="hide">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: [
    "show",
    "payload",
    "changePlanAction",
    "hide",
    "loading",
    "setLoadingState",
  ]
};
</script>

<style lang="stylus" scoped>
</style>
