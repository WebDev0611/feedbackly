<template>
  <v-layout>
    <v-flex class="text-xs-center">
      <h3 class="title-merriweather" v-translate>The Feedback Inbox</h3>
      <p class="subtitle text-xs-center" v-translate>The most intuitive way to handle feedback and respond directly to customers</p>

      <v-flex class="pa-3">
        <v-layout justify-center v-if="isOrganizationAdmin">
          <a class="btn btn--outline teal teal--text" style="cursor: pointer" href="https://www.feedbackly.com/pricing" target="_blank">
            <div class="btn__content" v-translate>See pricing</div>
            </a>
          <router-link class="btn btn--raised theme--dark teal" :to="{name: 'organization.settings'}">
            <div class="btn__content" v-translate>Upgrade now</div>
          </router-link>
        </v-layout>
        <p v-else class="italic" v-translate>
          Ask your organization administrator to upgrade the organization's subscription to use this feature.
        </p>
      </v-flex>

      <img src="/images/feedback-inbox-teaser.png" style="max-width: 700px;" />
    </v-flex>
  </v-layout>

</template>

<script>
export default {
  props: ["isOrganizationAdmin"],
  computed: {}
};
</script>

<style scoped lang="stylus">
@import '../../stylus/colors';

.title-merriweather {
  font-family: 'Merriweather';
  color: $dark;
}

p.subtitle {
  font-weight: 400;
  font-size: 1.1em;
}

img {
  max-width: 100%;
}

.italic {
  font-style: italic;
}
</style>
