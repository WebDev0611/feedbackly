<template>
  <div class="main">
    <button class="orb" :style="orbStyle" @click="toggle()"></button>
    <div class="picker" v-if="opened">
      <div class="relative">
        <button class="clear" @click="toggle()">
          <v-icon>clear</v-icon>
        </button>
        <Sketch v-model="internalColor" />
      </div>
    </div>
  </div>
</template>

<script>
import { Sketch } from "vue-color";
import { get } from "lodash";
import Color from "color";

export default {
  components: { Sketch },
  props: ["color", "onChange", "openedPicker", "onOpened"],
  data() {
    return {
      opened: false,
      internalColor: null,
      orbStyle: null,
      id: null
    };
  },
  created() {
    this.$set(this, "id", Date.now() + Math.random());
  },
  beforeMount() {
    if (this.color && this.internalColor == null) {
      const color = Color(this.color);
      this.$set(this, "orbStyle", { backgroundColor: color.string() });
    }
  },
  methods: {
    toggle() {
      this.$set(this, "opened", !this.opened);
    },
    makeString(input) {
      return Color({
        r: input.rgba.r,
        g: input.rgba.g,
        b: input.rgba.b
      })
        .alpha(input.rgba.a)
        .string();
    }
  },
  watch: {
    opened(newValue, oldValue) {
      if (newValue == true) {
        const color = Color(this.color);
        const object = {
          hsl: { ...color.hsl().object(), a: color.valpha },
          hex: color.hex(),
          hsl: { ...color.rgb().object(), a: color.valpha },
          hsv: { ...color.hsv().object(), a: color.valpha },
          oldHue: 0,
          source: "rgba",
          a: color.valpha
        };
        this.$set(this, "internalColor", object);
        this.$set(this, "orbStyle", { backgroundColor: color.string() });
        this.onOpened(this.id);
      }
    },
    internalColor(input) {
      if (!input.rgba) return;
      const string = this.makeString(input);
      this.onChange(string);
      this.$set(this, "orbStyle", { backgroundColor: string });
    },
    openedPicker(val) {
      if (val === this.id) return;
      this.$set(this, "opened", false);
    },
    color() {
      if (this.color && this.internalColor == null) {
        const color = Color(this.color);
        this.$set(this, "orbStyle", { backgroundColor: color.string() });
      }
    }
  }
};
</script>

<style scoped>
.main {
  position: relative;
  display: inline-block;
}
.orb {
  width: 25px;
  height: 25px;
  border-radius: 100%;
  border: 3px solid white;
  box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.4);
}

.picker {
  text-align: right;
  position: absolute;
  z-index: 900;
  left: 4em;
  top: -8em;
}

.clear {
  position: absolute;
  top: -20px;
  right: 42px;
}

.relative {
  position: relative;
}

button {
  outline: none;
}
</style>
