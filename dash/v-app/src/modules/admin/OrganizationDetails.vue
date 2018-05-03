<template>
  <v-container fluid style="position: relative">
    <v-layout row wrap>
      <v-flex xs12>
        <v-subheader>
          <translate>Organization</translate> 
        </v-subheader>
        <v-card class="grey lighten-4 elevation-0">
          <v-card-text>
            <v-layout row wrap>
              <v-flex xs12 sm7>
                <v-text-field box label="Organization name" :value="organization.name" @input="setOrganizationName"></v-text-field>
              </v-flex>
              <v-flex xs12 sm4 offset-xs1>
                <v-switch label="Active" :input-value="!organization.deactivated" @change="value => SET_ORGANIZATION_PROP({path: 'deactivated', value: !value})" color="green" hide-details></v-switch>
              </v-flex>
            </v-layout>
          </v-card-text>
        </v-card>
        <v-subheader>
          <translate>Segment</translate>
        </v-subheader>
        <v-card class="grey lighten-4 elevation-0">
          <v-card-text>
            <v-radio-group row v-model="organizationSegment">
              <v-radio v-for="(segment, index) in segmentOptions" :key="index" :label="segment.label" :value="segment.value"></v-radio>
            </v-radio-group>
          </v-card-text>
        </v-card>
        <v-subheader>
          <translate>Features</translate>
        </v-subheader>
        <v-card class="grey lighten-4 elevation-0">
          <v-card-text>

            <v-flex xs6 md3>
              <v-text-field label="Monthly Feedback limit" type="number" v-model="feedbackLimit" />
            </v-flex>

            <v-layout row wrap>
              <v-flex xs12 sm6 md6 v-for="(prop, index) in propList" :key="index">
                <v-switch :label="prop.label" :value="prop.value" v-model="organizationProps" color="indigo" hide-details>
                </v-switch>
              </v-flex>
            </v-layout>
          </v-card-text>
        </v-card>
        <span v-if="organizationProps.includes('SMS_MESSAGES') && organization.segment === 'SOLUTION_SALES'">
          <v-subheader>
            <translate>SMS Balance</translate>
          </v-subheader>
          <v-card class="grey lighten-4 elevation-0">
            <v-card-text>
              <v-layout row>
                <v-flex>
                  <h6 style="position:relative;top:25px;">{{ smsBalance | round }}€</h6>
                </v-flex>
                <v-flex>
                  <div class="inline-block" style="min-width: 150px;">
                    <v-select class="ml-3" style="max-width: 200px" v-model="topUpAmount" :items="topUpItems" :label="$gettext('Select amount')" single-line auto append-icon="euro_symbol" hide-details></v-select>
                  </div>
                  <div class="inline-block">
                    <v-btn flat color="teal" :disabled="!(topUpAmount > 0)" @click="topUpSms"> <translate>Top up</translate> </v-btn>
                  </div>
                </v-flex>
              </v-layout>
            </v-card-text>
          </v-card>
        </span>
        <span v-if="false">
          <v-subheader>
            <translate>Subscription</translate>
          </v-subheader>
          <v-card class="grey lighten-4 elevation-0">
            <v-card-text>
              <v-layout row wrap>
                <v-flex xs12 sm7 md7>
                  <v-chip class="primary white--text" v-translate>FREE PLAN</v-chip>
                  <span class="ml-4">
                    <v-chip outline class="primary--text">
                      <v-icon left>payment</v-icon>
                      <translate>Latest payment</translate>: 01.01.2017
                    </v-chip>
                  </span>
                  <div class="small mt-2">
                    <translate translate-comment="Used in 'To edit plan details, go to Stripe. They will update here then'">To edit plan details, go to Stripe. They will update here then</translate>
                    <a href="https://dashboard.stripe.com"><translate translate-comment="Used in 'To edit plan details, go to Stripe. They will update here then'">Stripe.</translate></a> <translate translate-comment="Used in 'To edit plan details, go to Stripe. They will update here then'">They will update here then</translate>.
                  </div>
                </v-flex>
                <v-flex xs12 sm3 md3>
                  <v-text-field name="input-3" label="Stripe id" :value="organization.stripe_customer_id" />
                </v-flex>
              </v-layout>
            </v-card-text>
          </v-card>
        </span>
        <v-subheader>
          <translate>Profanity Filter</translate>
        </v-subheader>
        <v-card class="grey lighten-4 elevation-0">
          <v-card-text>
            <v-radio-group v-model="profanityFilter" :mandatory="false" row>
              <v-radio :label="$gettext('Channel Specific')" value="device-specific"></v-radio>
              <v-radio :label="$gettext('Enabled')" value="enabled"></v-radio>
              <v-radio :label="$gettext('Disabled')" value="disabled"></v-radio>
            </v-radio-group>
          </v-card-text>
        </v-card>
      </v-flex>
      <div class="right">
        <v-btn fab small ripple @click="newOrganization">
          <v-icon>add</v-icon>
        </v-btn>
        <v-btn fab small class="teal" @click="SAVE_ORGANIZATION" :dark="!saving" :loading="saving" :disabled="saving">
          <v-icon>save</v-icon>
        </v-btn>
      </div>
    </v-layout>

    <span v-if="false" id="translations">
      <translate>Channel Specific</translate>
      <translate>Enabled</translate>
      <translate>Disabled</translate>
      <translate>Select amount</translate>
      <translate>Top up</translate>
    </span>
  </v-container>
</template>

<script>
import { mapMutations, mapActions, mapState } from "vuex";
import { get, without, intersection, difference, uniq } from "lodash";
import { NAMESPACE } from "./store";
import {
  SET_ORGANIZATION_PROP,
  SAVE_ORGANIZATION,
  SAVE_STATUS_SAVING,
  NEW_ORGANIZATION,
  TOP_UP_SMS
} from "./constants";

import features from "@/constants/features";

const properties = self => [
  { label: self.$gettext("Survey logic"), value: features.SURVEY_LOGIC },
  { label: self.$gettext("Creating channels"), value: features.CHANNEL_CREATION },
  { label: self.$gettext("Feedback inbox"), value: features.FEEDBACK_INBOX },
  { label: self.$gettext("File exports"), value: features.FILE_EXPORTS.ALL },
  { label: self.$gettext("Notifications to organization users"), value: features.NOTIFICATIONS.TO_ORGANIZATION_USERS },
  { label: self.$gettext("Notifications to organization all emails"), value: features.NOTIFICATIONS.TO_ALL_EMAILS },
  { label: self.$gettext("Survey appearance customization"), value: features.SURVEY_APPEARANCE_CUSTOMIZATION },
  { label: self.$gettext("Organization logo"), value: features.ORGANIZATION_LOGO },
  { label: self.$gettext("Sending SMS messages"), value: features.SMS_MESSAGES },
  { label: self.$gettext("Can use upsell functionality"), value: features.UPSELL_MODULE },
  { label: self.$gettext("REST API"), value: features.REST_API }
];

export default {
  name: "OrganizationDetails",
  methods: {
    ...mapMutations(NAMESPACE, [SET_ORGANIZATION_PROP, NEW_ORGANIZATION]),
    ...mapActions(NAMESPACE, [SAVE_ORGANIZATION, TOP_UP_SMS]),
    setOrganizationName(e) {
      this[SET_ORGANIZATION_PROP]({ path: "name", value: e });
    },
    newOrganization() {
      this[NEW_ORGANIZATION]();
      this.$router.push({ name: "admin.newOrganization" });
    },
    topUpSms() {
      this.TOP_UP_SMS({ charge: this.topUpAmount }).then(() => this.$set(this, "topUpAmount", null));
    },
  },
  computed: {
    ...mapState(NAMESPACE, {
      organization: state => state.activeOrganization.organization,
      saving: state => state.saveStatus == SAVE_STATUS_SAVING,
      smsBalance: state => state.activeOrganization.smsBalance,
    }),
    ...mapState("route", {
      route: state => state.name
    }),
    profanityFilter: {
      get(){
        return get(this, "organization.profanityFilter")
      },
      set(val){
        this[SET_ORGANIZATION_PROP]({ path: "profanityFilter", value: val });
      }
    },
    organizationSegment: {
      get() {
        return this.organization.segment;
      },
      set(value) {
        this[SET_ORGANIZATION_PROP]({ value, path: "segment" });
      }
    },
    feedbackLimit: {
      get() {
        const baseLimit = get(this, "organization.orgRights.responseLimit");
        const customLimit = get(this, "organization.custom_settings.responseLimit");
        return customLimit || baseLimit;
      },
      set(val) {
        if (parseInt(val) && parseInt(val) > 0) {
          this[SET_ORGANIZATION_PROP]({
            path: `custom_settings.responseLimit`,
            value: parseInt(val)
          });
        } else {
          this[SET_ORGANIZATION_PROP]({
            path: `custom_settings.responseLimit`,
            value: undefined
          });
        }
      }
    },
    organizationProps: {
      get() {
        const baseFeatures = get(this, "organization.orgRights.availableFeatures") || [];
        const enableFeatures = get(this, "organization.custom_settings.enableFeatures") || [];
        const disableFeatures = get(this, "organization.custom_settings.disableFeatures") || [];

        let features = without(baseFeatures, ...disableFeatures);
        features = [...features, ...enableFeatures];
        return features;
      },
      set(vals) {
        const oldVals = this.organizationProps;
        const newVals = vals;

        if (oldVals.length < newVals.length) {
          const oldValues = get(this, `organization.custom_settings.enableFeatures`) || [];
          const changedValues = difference(newVals, oldVals);

          const baseFeatures = get(this, "organization.orgRights.availableFeatures") || [];

          if (baseFeatures.indexOf(changedValues[0]) === -1) {
            this[SET_ORGANIZATION_PROP]({
              path: `custom_settings.enableFeatures`,
              value: uniq([...oldValues, ...changedValues])
            });
          }

          const disableValues = get(this, `organization.custom_settings.disableFeatures`) || [];
          const newDisabledValues = without(disableValues, ...changedValues);
          this[SET_ORGANIZATION_PROP]({
            path: `custom_settings.disableFeatures`,
            value: newDisabledValues
          });
        } else {
          const oldValues = get(this, `organization.custom_settings.disableFeatures`) || [];
          const changedValues = difference(oldVals, newVals);

          const baseFeatures = get(this, "organization.orgRights.availableFeatures") || [];
          if (baseFeatures.indexOf(changedValues[0]) > -1) {
            this[SET_ORGANIZATION_PROP]({
              path: `custom_settings.disableFeatures`,
              value: uniq([...oldValues, ...changedValues])
            });
          }

          // also delete from enabled
          const enabledValues = get(this, `organization.custom_settings.enableFeatures`) || [];
          const newEnabledValues = without(enabledValues, ...changedValues);
          this[SET_ORGANIZATION_PROP]({
            path: `custom_settings.enableFeatures`,
            value: newEnabledValues
          });
        }
      }
    }
  },

  beforeMount() {
    this.route == "admin.newOrganization" ? this[NEW_ORGANIZATION]() : null;
  },

  data() {
    return {
      segmentOptions: [
        { label: this.$gettext("Solution sales"), value: "SOLUTION_SALES" },
        { label: this.$gettext("Self-sign up"), value: "SELF_SIGNUP" },
        { label: this.$gettext("Test"), value: "TEST" }
      ],
      propList: properties(this),
      topUpItems: [5, 10, 20, 30, 50, 100, 200, 300, 400, 500],
      topUpAmount: null
    };
  },
  filters: {
    round: number => Math.round(number * 100) / 100
  }
};
</script>

<style scoped>
.small {
  font-size: 10px;
}

.right {
  position: absolute;
  right: 10px;
  top: 5px;
}
</style>
