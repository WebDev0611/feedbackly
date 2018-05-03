<template>
  <div>
    <v-layout row wrap justify-center class="text-xs-center">
      <v-flex xs12>
        <v-btn @click="() => SET_PHASE({phase: 1})" fab small class="float-left">
          <v-icon>arrow_back</v-icon>
        </v-btn>
        <h6 v-translate>Choose a subscription plan</h6>

        <p>
          <translate>All plans include unlimited distribution channels, all available channel types and unlimited surveys.</translate>
          <a href="https://www.feedbackly.com/pricing" target="_blank"><translate translate-comment="Used in'See our Pricing page for further details'">See our Pricing page</translate></a> <translate translate-comment="Used in'See our Pricing page for further details'"> for further details</translate>.
        </p>
      </v-flex>
      <v-flex v-for="(plan,i) in plans" xs6 md3 :key="i">
        <SubscriptionPlan :plan="plan" :change-plan="selectPlan" />
      </v-flex>
    </v-layout>
    <BillingInfo :billing-info="billingInfo" :set-organization-prop="SET_ORGANIZATION_PROP" :defaultEmail="organizationDetails.email" :show="showBillingModal" :close="() => setBillingInfoModalShow(false)" :submit="submitBillingInfo" />
    <CreditCardInfo :show="showCreditCardModal" :loading="creditCardLoading" :set-loading-state="setCreditCardLoading" :set-show-dialog="setCreditCardModalShow" :submit-token="submitCreditCardToken" />
  </div>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import { NAMESPACE } from "../store";
import { SET_PHASE, SET_ORGANIZATION_PROP } from "../constants";

import { plans } from "@/constants/subscription-plans";
import SubscriptionPlan from "@/modules/organization/components/SubscriptionPlan";
import BillingInfo from "../../organization/components/BillingInfo";
import CreditCardInfo from "../../organization/components/CreditCardInfo";

export default {
  data() {
    return {
      plans,
      showBillingModal: false,
      showCreditCardModal: false,
      creditCardLoading: false
    };
  },
  components: { SubscriptionPlan, BillingInfo, CreditCardInfo },
  methods: {
    ...mapMutations(NAMESPACE, [SET_PHASE, SET_ORGANIZATION_PROP]),
    setBillingInfoModalShow(bool) {
      this.$set(this, "showBillingModal", bool);
    },
    submitBillingInfo() {
      this.$set(this, "showBillingModal", false);
      this.setCreditCardModalShow(true);
    },
    setCreditCardModalShow(bool) {
      this.$set(this, "showCreditCardModal", bool);
    },
    selectPlan(plan) {
      this.SET_ORGANIZATION_PROP({ path: "plan", value: plan.id });
      if (plan.id != "FREE_PLAN") this.setBillingInfoModalShow(true);
      else this[SET_PHASE]({ phase: 3 });
    },
    submitCreditCardToken(token) {
      this.SET_ORGANIZATION_PROP({ path: "token", value: token });
      this.setCreditCardLoading(false);
      this.setCreditCardModalShow(false);
      this[SET_PHASE]({ phase: 3 });
    },
    setCreditCardLoading(bool) {
      this.$set(this, "creditCardLoading", bool);
    }
  },
  computed: {
    ...mapState(NAMESPACE, {
      organizationDetails: state => state.organizationDetails,
      billingInfo: state => state.organizationDetails.billingInfo
    })
  },
  setCreditCardLoading(bool) {
    this.$set(this, "creditCardLoading", bool);
  }
};
</script>

<style>
.float-left {
  float: left;
}
</style>
