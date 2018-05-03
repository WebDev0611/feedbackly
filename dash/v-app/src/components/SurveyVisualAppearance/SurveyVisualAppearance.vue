<template>
  <div>
    <v-layout row class="pt-2">
      <v-flex xs12 class="pl-1">
        <p v-translate>Here you can customize the visual appearance of the survey to better suit the style of your organization. </p>
        <p v-if="featureEnabled === false" class="bold">
          <translate>Note: this feature is not available in your subscription.</translate>
          <translate translate-comment="Used in 'please upgrade your plan to use this feature'">Please</translate>
          <router-link :to="{name: 'organization.settings'}">
            <translate translate-comment="Used in 'please upgrade your plan to use this feature'">upgrade your plan</translate>
          </router-link>
          <translate translate-comment="Used in 'please upgrade your plan to use this feature'">
            to use this feature.
          </translate>
        </p>
        <v-switch slot="activator" :input-value="customTheme.enabled" :disabled="!featureEnabled" @change="value => setThemeProp({path: 'enabled', value})" :label="$gettext('Enable custom visual appearance')"></v-switch>
        <transition name="fade">
          <v-layout row wrap>
            <v-flex xs12 md6>
              <p class="subheader" v-translate>Font</p>
              <v-layout row class="pa-2 grey lighten-4">
                <v-flex xs12>
                  <v-select :items="fonts" :value="customTheme.headingFont" @change="value => setThemeProp({path: 'headingFont', value})" :label="$gettext('Title font')" :hint="$gettext('Select a font for Question titles')" single-line bottom persistent-hint></v-select>
                </v-flex>
              </v-layout>
              <p class="subheader" v-translate>Color theme</p>
              <v-flex xs12 class="input-group pa-2 grey lighten-4">
                <label v-translate>Background color</label>
                <ColorPicker class="pl-2" :color="customTheme.backgroundColor" :on-change="setColor('backgroundColor')" :on-opened="pickerOnOpened" :opened-picker="openedPicker" />
              </v-flex>
              <v-flex xs12 class="input-group pa-2 grey lighten-4">
                <label v-translate>Title color</label>
                <ColorPicker class="pl-2" :color="customTheme.headingColor" :on-change="setColor('headingColor')" :on-opened="pickerOnOpened" :opened-picker="openedPicker" />
              </v-flex>
              <v-flex xs12 class="input-group pa-2 grey lighten-4">
                <label v-translate>Text color</label>
                <ColorPicker class="pl-2" :color="customTheme.textColor" :on-change="setColor('textColor')" :on-opened="pickerOnOpened" :opened-picker="openedPicker" />
              </v-flex>
              <v-flex xs12 class="input-group pa-2 grey lighten-4">
                <label v-translate>Button color</label>
                <ColorPicker class="pl-2" :color="customTheme.buttonBGColor" :on-change="setColor('buttonBGColor')" :on-opened="pickerOnOpened" :opened-picker="openedPicker" />
              </v-flex>
              <v-flex xs12 class="input-group pa-2 grey lighten-4">
                <label v-translate>Button text color</label>
                <ColorPicker class="pl-2" :color="customTheme.buttonTextColor" :on-change="setColor('buttonTextColor')" :on-opened="pickerOnOpened" :opened-picker="openedPicker" />
              </v-flex>
            </v-flex>
            <v-flex xs12 sm6 l4 class="">
              <h6 v-translate>Preview</h6>
              <div class="pa-4">
                <div class="preview" :style="`background-color: ${customTheme.backgroundColor}`">
                  <div class="heading" :style="Object.assign((fontStyle[customTheme.headingFont] || {}), {color: customTheme.headingColor})" v-translate>Question title</div>
                  <div class="subtitle" :style="{color: customTheme.textColor}" v-translate>subitles and text</div>
                  <div class="button" :style="{backgroundColor: customTheme.buttonBGColor}">
                    <span :style="{color: customTheme.buttonTextColor}" v-translate>button
                    </span>
                  </div>
                </div>
              </div>
            </v-flex>
          </v-layout>
        </transition>

      </v-flex>
    </v-layout>
  <span style="display:none">
    <translate>Enable custom visual appearance</translate>
    <translate>Title font</translate>
    <translate>Select a font for Question titles</translate>
  </span>
  </div>
</template>
<script>
import ColorPicker from "../ColorPicker";

const fontStyle = {
  Merriweather: {
    fontFamily: "Merriweather",
    fontWeight: 700,
    fontStyle: "italic"
  },
  Montserrat: {
    fontFamily: "Montserrat"
  }
};

const fonts = ["Montserrat", "Merriweather"];
const defaultAppearance = {
  headingFont: "Merriweather",
  backgroundColor: "rgba(247,247,247,1)",
  headingColor: "rgba(48, 188, 164, 1)",
  textColor: "rgba(131,133,135,1)",
  buttonBGColor: "rgba(48, 188, 164, 1)",
  buttonTextColor: "rgba(255,255,255,1)",
  enabled: false
};

export default {
  name: "SurveyVisualAppearance",
  components: { ColorPicker },
  props: ["customTheme", "setThemeProp", "featureEnabled"],
  data() {
    return {
      fonts,
      fontStyle,
      openedPicker: false
    };
  },

  methods: {
    setColor(path) {
      return value => {
        this.setThemeProp({ path, value });
      };
    },
    pickerOnOpened(id) {
      this.$set(this, "openedPicker", id);
    }
  }
};
</script>

<style scoped>
label {
  max-width: 170px;
}

.preview {
  width: 100%;
  border: 1px solid rgb(179, 179, 179);
  border-radius: 4px;
  text-align: center;
  font-family: "Montserrat", sans-serif;
}

.heading {
  padding: 1.5em;
  font-size: 1.8em;
  letter-spacing: 1px;
}

.subtitle {
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 1em;
}

.button {
  padding: 1em;
  max-width: 60%;
  margin: 1.2em auto;
  background-color: teal;
  text-transform: uppercase;
  color: white;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.bold {
  font-weight: 400;
}
</style>
