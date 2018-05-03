
<template>
  <div style="margin-bottom: 140px;">
    <v-btn fab small class="float-right" dark color="teal" @click="putOrganization">
      <v-icon>save</v-icon>
    </v-btn>
    <p class="pt-3 section-title" v-translate>Organization Logo</p>
    <p v-translate>Add your organization logo that will be visible on the survey</p>

    <v-layout class="pa-3 grey lighten-4" align-center>

      <v-flex v-if="logo && !image" xs12 sm4 md3 l2>
        <img :src="logo" style="width: 100%;" />
      </v-flex>

      <v-flex xs12 sm6 v-if="showUploadLogo" class="pa-4">
        <image-uploader :maxWidth="2000" :quality="1" :autoRotate="false" outputFormat="verbose" :preview=true :className="['fileinput', { 'fileinput--loaded' : image }]" @input="setImage">
        </image-uploader>
      </v-flex>
      <v-flex v-else xs12 sm6 class="pa-4">
        <v-layout row wrap align-center>
          <v-btn :disabled="logoEnabled === false" :dark="logoEnabled" flat color="teal" @click="setShowUploadLogo">Add a new logo</v-btn>
          <div v-if="logoEnabled === false"><translate translate-comment="Used in 'Please upgrade to a higher plan enable this feature'">Please</translate>
            <router-link :to="{name: 'organization.settings'}"><translate translate-comment="Used in 'Please upgrade to a higher plan enable this feature'">upgrade to a higher plan</translate> </router-link> <translate translate-comment="Used in 'Please upgrade to a higher plan to enable this feature'">to enable this feature</translate> </div>
        </v-layout>
      </v-flex>
    </v-layout>
    <div class="pt-3 pb-3">
      <p class="section-title" v-translate>Survey Visual Appearance</p>
      <SurveyVisualAppearance :custom-theme="visualAppearance" :set-theme-prop="setThemeProp" :feature-enabled="visualCustomizationEnabled" />
    </div>
  </div>
</template>

<script>
import { get } from "lodash";
import { mapState, mapMutations, mapActions } from "vuex";
import { NAMESPACE } from "./store";
import { SET_ORGANIZATION_PROP, PUT_ORGANIZATION } from "./constants";
import SurveyVisualAppearance from "@/components/SurveyVisualAppearance/SurveyVisualAppearance";
import { ImageUploader } from "vue-image-upload-resize";
import FEATURES from "@/constants/features";

export default {
  components: { SurveyVisualAppearance, ImageUploader },
  data() {
    return {
      image: null,
      showUploadLogo: false
    };
  },
  computed: {
    ...mapState(NAMESPACE, {
      visualAppearance: state => get(state, "selectedOrganization.custom_theme") || {},
      logo: state => get(state, "selectedOrganization.logo")
    }),
    ...mapState({
      availableFeatures: state => get(state, "userDetails.availableFeatures")
    }),
    visualCustomizationEnabled() {
      if (this.availableFeatures)
        return this.availableFeatures.indexOf(FEATURES.SURVEY_APPEARANCE_CUSTOMIZATION) > -1;
      return undefined;
    },
    logoEnabled() {
      if (this.availableFeatures) return this.availableFeatures.indexOf(FEATURES.ORGANIZATION_LOGO) > -1;
      return undefined;
    }
  },
  methods: {
    ...mapActions(NAMESPACE, [PUT_ORGANIZATION]),
    ...mapMutations(NAMESPACE, [SET_ORGANIZATION_PROP]),
    setThemeProp(payload) {
      this[SET_ORGANIZATION_PROP]({
        value: payload.value,
        path: "custom_theme." + payload.path
      });
    },
    setImage(base64) {
      this.$set(this, "image", base64);
    },
    putOrganization() {
      this[PUT_ORGANIZATION]({ base64Logo: this.image });
    },
    setShowUploadLogo() {
      this.$set(this, "showUploadLogo", true);
    }
  }
};
</script>

<style lang="stylus">

.float-right {
  float: right;
}

.fileinput {
}

.img-preview {
  display: block;
  width: 200px;
  margin: 1em;
}
</style>
