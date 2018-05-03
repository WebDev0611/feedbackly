<template>
  <div>
    <div v-for="(value, i) in values" :key="i" class="slider-container">
      <div class="value">{{value.data}}/{{value.scale}}</div>
      <div class="label">{{value.label}}</div>
    </div>

  </div>
</template>

<script>
export default {
  props: ["values"]
};
</script>

<style lang="stylus" scoped>
@import '../../stylus/colors';

.slider-container {
  display: inline-block;
  text-align: center;
  margin: 1em;

  .value {
    font-size: 1.7em;
  }

  .label {
    font-weight: 400;
    color: $grey-dark;
  }
}
</style>
