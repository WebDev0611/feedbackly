<template>
  <div>
    <v-layout v-if="organization" row wrap class="aligncenter">
      <v-flex xs7 sm9 md10>
        <v-text-field box :label="$gettext('Organization name')" :value="organization.name" @input="val => SET_ORGANIZATION_PROP({path: 'name', value: val})"></v-text-field>
      </v-flex>
      <v-flex xs5 sm3 md2 class="text-xs-right">
        <v-btn flat primary @click="PUT_ORGANIZATION">
          <translate>Update</translate>
        </v-btn>
      </v-flex>

      <v-flex v-if="mainScreenLoading" justify-center class="text-xs-center">
        <v-progress-circular indeterminate v-bind:size="50" color="primary"></v-progress-circular>
      </v-flex>

      <v-flex xs6 md3 v-if="organization.segment == 'SELF_SIGNUP' && organization.billingDetails && !mainScreenLoading" v-for="(plan, i) in plans" :key="i">
        <SubscriptionPlan :key="i" :plan="plan" :selected-plan="selectedPlan(organization)" :change-plan="changePlan" :has-downgraded="billingDetails.hasDowngraded" :has-credit-card="hasCreditCard" />
      </v-flex>
      <v-flex xs12 v-if="organization.segment == 'SELF_SIGNUP' && organization.billingDetails && !mainScreenLoading">
        <v-layout row wrap class="aligncenter mt-4">
          <v-flex xs12 class="aligncenter">
            <h5 v-translate>Invoicing preferences</h5>
            <v-layout row fluid wrap>
              <v-flex xs12 sm6>
                <span class="property blue-grey--text text--darken-2" v-translate>Credit card:</span>
                <p v-if="creditCard && creditCard.last4 && creditCard.last4.length === 4">{{creditCard.brand}} <translate>Ending with</translate> {{creditCard.last4}},
                  <span class="property blue-grey--text text--darken-2" v-translate>expires</span> {{creditCard.exp_month}}/{{creditCard.exp_year}}
                </p>
                <p v-else v-translate>
                  No credit card saved. Please add a card.
                </p>
              </v-flex>
              <v-flex xs12 sm6>
                <v-btn flat color="primary" class="ml-0" @click="setShowCreditCard(true)">
                  <translate>Update Credit card</translate>
                  </v-btn>
              </v-flex>
            </v-layout>

            <v-layout row fluid wrap>
              <v-flex xs12 sm6>
                <span class="property blue-grey--text text--darken-2" v-translate>Billing address:</span>
                <p>{{ billingInfo.address }}</p>
                <span class="property blue-grey--text text--darken-2" v-translate>VAT-ID:</span>
                <p>{{ billingInfo.vatId }}</p>
                <span class="property blue-grey--text text--darken-2" v-translate>Country:</span>
                <p>{{ billingInfo.country | countryName }}</p>
              </v-flex>
              <v-flex xs12 sm6>
                <v-btn color="primary" flat class="ml-0" @click="() => setShowBilling(true)">
                  <translate>Edit Billing info</translate>
                  </v-btn>
              </v-flex>
            </v-layout>

          </v-flex>
        </v-layout>

        <v-layout>
          <OrganizationCharges :organization-id="organization._id" :billing-info="{billingInfo, name: organization.name}" />
        </v-layout>
      </v-flex>
      <BillingInfo :show="showBillingDialog" :submit="() => PUT_ORGANIZATION().then(show => setShowBilling(show))" :close="() => setShowBilling(false)" :billing-info="billingInfo" :default-email="email" :set-organization-prop="SET_ORGANIZATION_PROP" :loading="loadingState" />
      <CreditCardInfo :show="showCreditCardDialog" :set-show-dialog="setShowCreditCard" :submit-token="submitCreditCardToken" :loading="loadingState" :set-loading-state="SET_LOADING_STATE" />
      <ChangePlanDialog v-if="changePlanPayload != null" :show="changePlanDialog" :payload="changePlanPayload" :change-plan-action="changePlanAction" :hide="() => setShowPlanDialog(false)" :loading="loadingState" :set-loading-state="SET_LOADING_STATE" />
    </v-layout>
    <span style="display:none">
      <translate>Organization name</translate>
    </span>
  </div>
</template>




<script>
import { mapActions, mapState, mapMutations } from "vuex";
import { get, find } from "lodash";
import SubscriptionPlan from "./components/SubscriptionPlan";
import BillingInfo from "./components/BillingInfo";
import CreditCardInfo from "./components/CreditCardInfo";
import ChangePlanDialog from "./components/ChangePlanDialog";
import OrganizationCharges from "@/components/OrganizationCharges";
import { COUNTRIES } from "@/constants/countries";

import { NAMESPACE } from "./store";
import {
  GET_ORGANIZATION,
  SET_ORGANIZATION_PROP,
  PUT_ORGANIZATION,
  SAVE_CREDIT_CARD_TOKEN,
  SET_LOADING_STATE,
  CHANGE_PLAN
} from "./constants";

import { SET_UI_MESSAGE } from "@/constants/main";

import { plans } from "@/constants/subscription-plans";

export default {
  components: { SubscriptionPlan, BillingInfo, CreditCardInfo, ChangePlanDialog, OrganizationCharges },
  methods: {
    ...mapActions(NAMESPACE, [GET_ORGANIZATION, PUT_ORGANIZATION, SAVE_CREDIT_CARD_TOKEN, CHANGE_PLAN]),
    ...mapMutations(NAMESPACE, [SET_ORGANIZATION_PROP, SET_LOADING_STATE]),
    ...mapMutations([SET_UI_MESSAGE]),
    selectedPlan(organization) {
      return find(this.plans, {
        id: get(organization, "billingDetails.currentPlan.name")
      });
    },
    setShowBilling(bool) {
      this.$set(this, "showBillingDialog", bool);
    },
    setShowCreditCard(bool) {
      this.$set(this, "showCreditCardDialog", bool);
    },
    setShowPlanDialog(bool) {
      this.$set(this, "changePlanDialog", bool);
    },
    submitCreditCardToken(token) {
      this[SAVE_CREDIT_CARD_TOKEN](token)
        .then(() => {
          this.setShowCreditCard(false);
          this[SET_UI_MESSAGE]({ text: "Credit card updated successfully", color: "success" });
        })
        .catch(() => this.SET_LOADING_STATE(false));
    },
    changePlanAction(payload) {
      this[SET_LOADING_STATE](true);
      this[CHANGE_PLAN](payload)
        .then(() => {
          this.setShowPlanDialog(false);
          this[GET_ORGANIZATION]();
          setTimeout(() => this[SET_LOADING_STATE](false), 1000);
        })
        .catch(() => this[SET_LOADING_STATE](false));
    },
    changePlan(payload) {
      this.$set(this, "changePlanPayload", payload);
      this.setShowPlanDialog(true);
    }
  },
  computed: {
    ...mapState(NAMESPACE, {
      organization: state => state.selectedOrganization,
      billingDetails: state => get(state, "selectedOrganization.billingDetails") || {},
      billingInfo: state => get(state, "selectedOrganization.billingInfo") || {},
      creditCard: state => get(state, "selectedOrganization.billingDetails.creditCard") || {},
      loadingState: state => state.loading
    }),
    ...mapState({
      email: state => get(state, "userDetails.email")
    }),
    hasCreditCard() {
      return !!get(this, "creditCard.last4");
    },
    mainScreenLoading() {
      return this.loadingState && !this.showBillingDialog && !this.showCreditCardDialog;
    }
  },
  data() {
    return {
      showBillingDialog: false,
      showCreditCardDialog: false,
      changePlanDialog: true,
      changePlanPayload: null,
      plans
    };
  },
  filters: {
    countryName: name => (find(COUNTRIES, { value: name }) || {}).text
  }
};
</script>

<style scoped>
.aligncenter {
  align-items: center;
}
.property {
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
</style>
