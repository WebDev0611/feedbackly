<template>

  <div class="wrapper-cont">
    <img :src="value.url" />
    <div class="label">{{value.label}}</div>
  </div>
</template>

<script>
export default {
  props: ["value"]
};
</script>

<style lang="stylus" scoped>
.wrapper-cont {
  display: inline-block;
}

img {
  max-width: 100%;
  width: 8em;
}

.label {
  text-align: center;
  font-weight: 400;
  text-transform: uppercase;
}
</style>
