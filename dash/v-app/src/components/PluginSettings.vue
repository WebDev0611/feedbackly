<template>
  <div>

    <v-container>
      <v-subheader>
        <translate>Widget installation</translate>
      </v-subheader>
      <v-card class="elevation-0 grey lighten-4">
        <v-card-text>
          <p><translate>After</translate>
            <a href="#" translate-comment="Used in 'installing the general source code for Feedbackly widget on your site, add the following unique script code for this channel wherever you want to have the triggering rules evaluated and the survey tied to this particular channel triggered. For several surveys, create more channels and place their unique code on the site aswell.'">installing the general source code</a> <translate translate-comment="Used in 'installing the general source code for Feedbackly widget on your site, add the following unique script code for this channel wherever you want to have the triggering rules evaluated and the survey tied to this particular channel triggered. For several surveys, create more channels and place their unique code on the site aswell.'">for Feedbackly widget on your site, add the following unique script code for this channel wherever you want to have the triggering rules evaluated and the survey tied to this particular channel triggered. For several surveys, create more channels and place their unique code on the site aswell.</translate></p>
          <v-text-field readonly :label="$gettext('Unique widget code')" :value="getScript(udid)"></v-text-field>
        </v-card-text>
      </v-card>
    </v-container>
    <v-container>
      <v-subheader>
        <translate>Channel settings</translate>
      </v-subheader>
      <v-card class="elevation-0 grey lighten-4">
        <v-layout class="text-xs-center pa-4">
          <v-flex>
            <img src="http://via.placeholder.com/130x130"><br />
            <v-btn round small class="indigo--text"
            :style="pluginSettings.display === 'popup' ? displayModeSelectedStyle : ''"
            @click="() => changeProp({path: 'display', value: 'popup'})"
            :disabled="pluginSettings.display === 'popup'"
            :outline="pluginSettings.display !== 'popup'" v-translate>Corner window</v-btn>
          </v-flex>
          <v-flex>
            <img src="http://via.placeholder.com/130x130"><br />
               <v-btn round small class="indigo--text"
            :style="pluginSettings.display === 'modal' ? displayModeSelectedStyle : ''"
            @click="() => changeProp({path: 'display', value: 'modal'})"
            :disabled="pluginSettings.display === 'modal'"
            :outline="pluginSettings.display !== 'modal'" v-translate>Popup window</v-btn>
          </v-flex>
          <v-flex>
            <img src="http://via.placeholder.com/130x130"><br />
               <v-btn round small class="indigo--text"
            :style="pluginSettings.display === 'embedded' ? displayModeSelectedStyle : ''"
            @click="() => changeProp({path: 'display', value: 'embedded'})"
            :disabled="pluginSettings.display === 'embedded'"
            :outline="pluginSettings.display !== 'embedded'" v-translate>Embedded</v-btn>
          </v-flex>
        </v-layout>

        <v-layout class="pa-4">
          <v-flex v-if="pluginSettings.display === 'popup'">
            <v-layout row>
              <v-flex class="pt-4" v-translate>
                Positioning
              </v-flex>
              <v-flex>
                <v-select v-bind:items="positionOptions" :value="pluginSettings.placement" item-text="label" item-value="key" single-line bottom></v-select>
              </v-flex>
            </v-layout>
          </v-flex>
          <v-flex v-if="pluginSettings.display === 'embedded'">
            <v-layout row>
              <v-flex>
                <translate>Embedding element</translate>
                <p class="grey--text" v-translate>Add this element to your web page and the survey will be embedded to it.</p>
                <v-text-field readonly :label="$gettext('Widget mount code')" :value="getMountDiv(udid)"></v-text-field>
              </v-flex>
            </v-layout>
          </v-flex>
        </v-layout>
      </v-card>
    </v-container>
    <v-container>
      <v-subheader>
        <translate>Triggering conditions</translate>
      </v-subheader>
      <v-card class="elevation-0 grey lighten-4">
        <v-card-text>
          <div class="property">
            <v-icon class="teal--text mr-2" v-translate>description</v-icon> <translate>Display only on certain pages</translate></div>
          <div v-translate>An URL or partial URL. If it matches, the survey will trigger once all other conditions are fulfilled. eg. "/products", "/products/shoes"</div>
          <v-layout class="text-xs-center">
            <v-flex>
              <div class="text-xs-left">
                <v-chip small close v-for="(val, index) of pluginSettings.urlPatterns.rules" :key="index"
                @input="removeURLRule(index)" >{{val}}</v-chip>
              </div>

              <v-text-field :label="$gettext('Enter an URL or a partial URL')" v-model="urlPattern" @keyup.enter="addUrlPattern"></v-text-field>

              <v-radio-group v-model="urlMode">
                <v-radio :label="$gettext('Any entered URL needs to be visited before triggering')" value="single"></v-radio>
                <v-radio :label="$gettext('All entered URLs need to be visited before triggering')" value="all"></v-radio>
                <v-radio :label="$gettext('All entered URLs need to be visited in order before triggering')" value="order"></v-radio>
                <v-radio :label="$gettext('Do not trigger in the entered URLs')" value="exclude"></v-radio>
              </v-radio-group>
            </v-flex>
          </v-layout>

          <v-layout row>
            <v-flex class="property equal-width pt-2">
              <v-icon class="teal--text mr-2">content_copy</v-icon>
              <translate>Number of pages visited</translate>
            </v-flex>
            <v-flex style="max-width: 120px">
              <v-select :items="numbers(100)" :value="pluginSettings.showAfterVisitedPages" single-line bottom
              @change="value => changeProp({path: 'showAfterVisitedPages', value})"></v-select>
            </v-flex>
          </v-layout>

          <div class="property">
            <v-icon class="teal--text mr-2">hourglass_full</v-icon>
            <translate>Visiting time</translate>
          </div>

          <v-layout row>
            <v-flex class="equal-width pt-3">Display after visiting the
              <b>site</b> for {{pluginSettings.showAfterSecondsOnSite}} seconds </v-flex>
            <v-flex>
              <v-slider min="0" max="500"
              thumb-label :value="pluginSettings.showAfterSecondsOnSite" @input="value => changeProp({path: 'showAfterSecondsOnSite', value})"></v-slider>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex class="equal-width pt-3">Display after visiting the
              <b>page</b> for {{pluginSettings.showAfterSecondsOnPage}} seconds </v-flex>
            <v-flex>
              <v-slider min="0" max="300"
              thumb-label :value="pluginSettings.showAfterSecondsOnPage" @input="value => changeProp({path: 'showAfterSecondsOnPage', value})"></v-slider>
            </v-flex>
          </v-layout>

          <div class="property">
            <v-icon class="teal--text mr-2">mouse</v-icon>
            <translate>Scrolling</translate>
          </div>
          <v-layout row>
            <v-flex class="equal-width pt-3">
              When user has scrolled down {{pluginSettings.afterPercentage}}% of the page
            </v-flex>
            <v-flex>
              <v-slider
              thumb-label :value="pluginSettings.afterPercentage" @input="value => changeProp({path: 'afterPercentage', value})"></v-slider>
            </v-flex>
          </v-layout>

          <div class="property">
            <v-icon class="teal--text mr-2">group</v-icon>
            <translate>Audience</translate>
          </div>
          <v-layout row>
            <v-flex class="equal-width pt-3">
              Display to {{Math.ceil(pluginSettings.sampleRatio*100)}}% of visitors
            </v-flex>
            <v-flex>
              <v-slider thumb-label :value="pluginSettings.sampleRatio*100"
              min="0" max="100"
              @input="value => changeProp({path: 'sampleRatio', value: value/100})"></v-slider>
            </v-flex>
          </v-layout>

          <div class="property">
            <v-icon class="teal--text mr-2">exit_to_app</v-icon>
            <translate>Exit intent</translate>
          </div>
          <v-layout row>
            <v-flex class="equal-width pt-4" v-translate>
              Display when user tries to exit page
            </v-flex>
            <v-flex>
              <v-switch value :input-value="pluginSettings.exitTrigger" @change="value => changeProp({path: 'exitTrigger', value})"></v-switch>
            </v-flex>
          </v-layout>

          <div class="property">
            <v-icon class="teal--text mr-2">autorenew</v-icon>
            <translate>Redisplay conditions</translate>
          </div>

          <v-layout row>
            <v-flex class="equal-width pt-3">Redisplay after being closed for {{pluginSettings.hiddenAfterClosedForHours}} hours </v-flex>
            <v-flex>
              <v-slider min="0" max="1000" thumb-label :value="pluginSettings.hiddenAfterClosedForHours" @input="value => changeProp({path: 'hiddenAfterClosedForHours', value})"></v-slider>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex class="equal-width pt-3">Redisplay after survey has been answered after {{pluginSettings.hiddenAfterFeedbackForHours}} hours

            </v-flex>

            <v-flex>
              <v-slider min="0" max="1000" thumb-label :value="pluginSettings.hiddenAfterFeedbackForHours" @input="value => changeProp({path: 'hiddenAfterFeedbackForHours', value})"></v-slider>
            </v-flex>
          </v-layout>

        </v-card-text>
      </v-card>
    </v-container>
  <span style="display:none;">
    <translate>Unique widget code</translate>
    <translate>Widget mount code</translate>
    <translate>Enter an URL or a partial URL</translate>
    <translate>Any entered URL needs to be visited before triggering</translate>
    <translate>All entered URLs need to be visited before triggering</translate>
    <translate>All entered URLs need to be visited in order before triggering</translate>
    <translate>Do not trigger in the entered URLs</translate>
  </span>
  </div>
</template>

<script>
/* eslint-disable */
import { forEach, range } from 'lodash'
import PropRow from './PropRow'
export default {
  name: 'PluginSettings',
  props: ['pluginSettings', 'udid', 'changeProp'],
  components: { PropRow },
  data() {
    return {
      positionOptions: [
        { key: 'bottom-right', label: $this.gettext('Bottom right') },
        { key: 'bottom-left', label: $this.gettext('Bottom left') },
        { key: 'top-right', label: $this.gettext('Top right') },
        { key: 'top-left', label: $this.gettext('Top left') },

      ],
      slider1: 0,
      displayModeSelectedStyle: "background-color: #3f51b5 !important;color:white !important;",
      urlPattern: ''
    }
  },
  methods: {
    numbers(qty) {
      return range(0, qty)
    },
    removeURLRule: function(index){
      const rules = [...this.pluginSettings.urlPatterns.rules];
      rules.splice(index, 1);
      this.changeProp({path: 'urlPatterns.rules', value: rules})
    },
    addUrlPattern: function(){
      const value = this.urlPattern;
      if(value.length > 0 && this.pluginSettings.urlPatterns.rules.indexOf(value) == -1) {
        this.changeProp({path:'urlPatterns.rules', value: [...this.pluginSettings.urlPatterns.rules, value]})
        this.urlPattern = '';
      }
    },
    getScript: function(udid) { return `<script>var plugin_${udid} = new Fbly('${udid}');<\/script>` },
    getMountDiv: udid => `<div id="feedback-plugin-container-${udid}"></div>`
  },
  computed: {
    urlMode: {
      get(){
        return this.pluginSettings.urlPatterns.mode
      },
      set(value){
        this.changeProp({path: 'urlPatterns.mode', value})
      }
    }
  }
}
</script>

<style scoped>
  .property {
    font-weight: 700;
    margin: 10px 0;
  }

  .bold {
    font-weight: 700;
  }

  .equal-width {
    width: 130px;
    max-width: 320px;
  }

</style>
