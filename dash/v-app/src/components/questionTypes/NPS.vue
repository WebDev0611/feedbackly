<template>
  <div class="nps-container">
      {{ computedValue }}
  </div>
</template>

<script>
import { get } from "lodash";
export default {
  props: ["value"],
  computed: {
    computedValue(){
      if(this.value < 1) return parseInt(this.value * 10);
      else return this.value;
    }
  }
};
</script>

<style lang="stylus" scoped>
  .nps-container{
    width: 1.5em;
    height: 1.5em;
    color: white;
    font-size: 1em;
    line-height 1em;
    background-color grey;
    border-radius: 100%;
    text-align center;
    font-weight: 400;

    &.medium{
      width: 1.7em;
      height: 1.7em;
      font-size: 1.7em;
      line-height 1.7em;
    }

     &.large{
      width: 2em;
      height: 2em;
      font-size: 2em;
      line-height 2em;
    }
  }
</style>
