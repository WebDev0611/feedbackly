<template>
    <v-layout>
    <v-flex class="prop">
      <div class="property-name blue-grey--text text--lighten-2">
        {{ label }}
      </div>
    </v-flex>
    <v-flex class="text-xs-left">
      {{ data }}
      <slot></slot>
    </v-flex>
  </v-layout>
</template>

<script>
/* eslint-disable */
export default {
  props: ['label', 'data']
}
</script>

<style scoped>
  .prop{
    max-width: 200px;
    width: 200px;
    min-width: 200px;
  }
  .property-name{
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
</style>