<template>
  <div class="button-container">
    <div v-if="background" :class="bg"></div>
    <img v-else :src="url" />
  </div>
</template>

<script>
import { get } from "lodash";
export default {
  props: ["opts", "value", "background"],
  computed: {
    getFace() {
      const scale = this.opts.buttonCount;
      const style = !!get(this, "opts.buttonStyle.plain");

      let number = scale - Math.round((this.value*(scale-1)))

      if(scale == 4 && number > 2) number++

      return { number, style: style ? "b" : "a" };
    },
    bg() {
      return `button--${this.getFace.style}--${this.getFace.number}`;
    },
    url() {
      return `/images/faces/${this.getFace.number}${this.getFace.style}.png`;
    }
  }
};
</script>

<style lang="stylus" scoped>
.button-container {
  div, img {
    width: 100%;
    height: 100%;
    min-width: 10px;
    min-height: 10px;
    background-size: contain;
  }

  .button {
    &-default {
      &-1 {
        background-image: url('/images/faces/1a.png');
      }
    }

    &-plain {
    }
  }
}
</style>
