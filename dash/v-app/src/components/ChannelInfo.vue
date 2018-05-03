<template>
  <v-card class="elevation-0 ml-1 full-height">
    <v-card-title primary-title>
      <div class="headline">
        <span v-if="channel.name == '' && channel.isNew" v-translate>
          New channel
        </span>
        <span v-else>
          {{ channel.name }}
        </span>
      </div>
    </v-card-title>

    <v-card-text>
      <v-layout row v-if="channel && channel._id">
        <v-flex xs12>
          <PropRow :label="$gettext('Feedback count')" :data="channel.feedback_count" />
          <PropRow :label="$gettext('Link')" v-if="['LINK', 'QR'].indexOf(channel.type) > -1">
            <a :href="'http://fbly.io/' + channel.udid" target="_blank">{{'http://fbly.io/' + channel.udid}}</a>
          </PropRow>
          <PropRow :label="$gettext('Passcode')" v-if="channel.type == 'DEVICE'" :data="channel.passcode" />
          <PropRow :label="$gettext('Last seen')" :data="channel.last_seen | date" />
          <PropRow :label="$gettext('Last feedback')" :data="channel.last_feedback | date" />
          <PropRow :label="$gettext('Last seen battery')" v-if="battery > -1">
            <div class="battery">
              <div class="battery-progress" :style="(channel.last_seen_battery) | batteryFormat">
                &nbsp;
              </div>
              <div class="battery-progress-text">
                {{channel.last_seen_battery}}%
              </div>
            </div>
          </PropRow>
          <PropRow :label="$gettext('Active survey')" :data="channel.active_survey" />
          <PropRow :label="$gettext('Users with access')" :data="(channel.rightsToDevice || []).join(', ')" />
          <PropRow :label="$gettext('Authorization code')" v-if="channel.type == 'DEVICE' && context != 'admin'" :data="channel.udid" />

        </v-flex>
        <v-flex xs12 sm4 class="text-xs-center" v-if="channel.type === 'QR'">

          <qr-code :text="channel.udid | url" size="100"></qr-code>
          <br />
        </v-flex>
      </v-layout>

      <v-container>
        <v-subheader>
          <translate>Channel details</translate>
        </v-subheader>
        <v-card class="grey lighten-4 elevation-0 pt-3">
          <v-layout row>
            <v-flex xs12 sm6 class="pl-4 pr-4">
              <v-text-field :value="channel.name" :label="$gettext('Name')" @input="value => changeProp({path:'name', value})"></v-text-field>
            </v-flex>

            <v-flex xs12 sm6 class="pl-4 pr-4" v-if="context == 'admin'">
              <v-select :items="channelTypes" :label="$gettext('Channel Type')" :value="channel.type" @change="value => changeProp({path: 'type', value})" bottom></v-select>
            </v-flex>
          </v-layout>

          <v-layout row wrap v-if="context == 'admin'">
            <v-flex xs12 sm6 class="pl-4 pr-4">
              <v-text-field :value="channel.udid" :label="'UDID ' + (channel.isNew ? $gettext('leave empty to generate') : '')" @input="value => changeProp({path:'udid', value})"></v-text-field>
            </v-flex>

            <v-flex xs12 sm6 class="pl-4 pr-4 relative-with-link" v-if="channel.type == 'DEVICE'">
              <v-text-field :value="channel.mdm_link" :label="$gettext('Meraki link')" @input="value => changeProp({path:'mdm_link', value})" style="padding-right: 23px;"></v-text-field>
              <a :href="channel.mdm_link" target="_blank" class="top-right no-decorations" style="top: 21px; right: 20px;">
                <v-icon class="indigo--text">open_in_new</v-icon>
              </a>
            </v-flex>
          </v-layout>

          <v-layout row>
            <v-flex xs12 sm6 class="pl-4 pr-4">
              <v-text-field :value="channel.ip_assignment" :label="$gettext('Assigned IP address')" @input="value => changeProp({path:'ip_assignment', value})" />
            </v-flex>

            <v-flex xs12 sm6 class="pl-4 pr-4">
              <v-btn color="indigo" flat @click="() => changeProp({path: 'ip_assignment', value: null })">
                <translate>Clear IP address</translate>
              </v-btn>
            </v-flex>
          </v-layout>


          <v-flex xs12 class="pl-4 pr-4">
            <v-text-field :value="channel.description" :label="$gettext('Description')" @input="value => changeProp({path:'description', value})"></v-text-field>
          </v-flex>
        </v-card>
      </v-container>

      <PluginSettings v-if="channel.type === 'PLUGIN' && channel.settings && channel.settings.pluginSettings" :plugin-settings="channel.settings.pluginSettings" :udid="channel.udid" :change-prop="setPluginProp" />
    </v-card-text>
    <span style="display:none">
      <translate>Name</translate>
      <translate>Channel Type</translate>
      <translate>Meraki link</translate>
      <translate>Assigned IP address</translate>
      <translate>Feedback count</translate>
      <translate>Link</translate>
      <translate>Passcode</translate>
      <translate>Last seen</translate>
      <translate>Last feedback</translate>
      <translate>Last seen battery</translate>
      <translate>Active survey</translate>
      <translate>Users with access</translate>
      <translate>Authorization code</translate>
      <translate>(leave empty to generate)</translate>
      <translate>Description</translate>
    </span>
  </v-card>
</template>

<script>
/* eslint-disable */
// import VueQrcode from 'vue-qrcode'
import { date } from "../utils/filters";
import PropRow from "./PropRow";
import PluginSettings from "./PluginSettings";

export default {
  props: ["channel", "context", "changeProp"],
  computed: {
    battery() {
      return parseInt(this.channel.last_seen_battery);
    },
  },
  methods: {
    setPluginProp(action) {
      const { path, value } = action;
      this.changeProp({ path: `settings.pluginSettings.${path}`, value });
    }
  },
  filters: {
    date,
    batteryFormat: battery => {
      let color = "#27ae60"; // green
      if (battery < 50) color = "#f1c40f"; // yellow
      if (battery < 20) color = "#e74c3c"; // red
      return `width: ${battery}%; background-color: ${color};`;
    },
    url: udid => `https://survey.feedbackly.com/surveys/${udid}`
  },
  components: { PropRow, PluginSettings /* VueQrcode */ },
  data() {
    return {
      channelTypes: ["DEVICE", "QR", "PLUGIN", "LINK", "EMAIL", "SMS"]
    };
  }
};
</script>

<style scoped>
.relative-with-link {
  position: relative;
}

.top-right {
  position: absolute;
  top: 7px;
  right: 0;
}

.battery {
  width: 100px;
  border-radius: 3px;
  border: 1px solid rgba(0, 0, 0, 0.23);
  position: relative;
}
.battery-progress-text {
  top: 0;
  width: 100px;
  position: absolute;
  text-align: center;
}

.no-decorations {
  text-decoration: none;
}
</style>
