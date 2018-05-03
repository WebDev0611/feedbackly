<template>
  <div class="plan-details" :class="planIsSelected ? 'selected' : ''">
    <div class="inner">
      <h6 class="bottom-border" :class="planIsSelected ? 'teal white--text' : 'grey lighten-3 blue-grey--text text--darken-2'">

        {{ plan.name }}

        <div class="current-plan">
          <span v-if="planIsSelected" v-translate>Current plan</span>
          <span v-if="isFuturePlan" v-translate>Future plan</span>
          &nbsp; <br>
          <span class="subscription-info">
            <span v-if="isOldPlan">
              <translate>Subscription ends at </translate> {{ hasDowngraded.oldPlan.ends | unixToDate }} </span>
            <span v-if="isFuturePlan">
              <translate>Subscription starts at </translate> {{ hasDowngraded.futurePlan.starts | unixToDate }} </span>
            &nbsp;
          </span>

        </div>

      </h6>
      <div class="price">{{ plan.price }} €</div>
      <div class="description">
        {{ plan.description }}
      </div>
      <div class="subheading inner-title" style="font-size: 18px !important;">
        {{ plan.respondents }}
      </div>
      <div class="description" v-translate>
        monthly responses
      </div>
      <div class="features">
        <div class="subheading bottom-border" v-translate>Features</div>
        <ul class="min-height-features">
          <li v-for="(feature, i) in plan.features" :key="i">{{ feature }}</li>
        </ul>
      </div>
      <div v-if="selectedPlan">
        <v-btn v-if="selectedPlan.id == plan.id && !isOldPlan" disabled flat color="primary">
          <translate>Current plan</translate>
        </v-btn>
        <span v-else>
          <span v-if="hasCreditCard">
            <v-btn v-if="selectedPlan.id == plan.id && isOldPlan" color="primary" @click="() => changePlan({id: plan.id, type: 'CANCEL_DOWNGRADE'})" v-translate>Cancel downgrade</v-btn>
            <v-btn v-if="isFuturePlan" disabled flat color="primary" v-translate>Downgraded</v-btn>
            <v-btn v-if="selectedPlan.order > plan.order && !isFuturePlan" flat @click="() => changePlan({id: plan.id, type: 'DOWNGRADE'})" >
              <translate>Downgrade</translate>
            </v-btn>
            <v-btn v-if="selectedPlan.order < plan.order" color="primary" @click="() => changePlan({id: plan.id, type: 'UPGRADE'})">
              <translate>Upgrade</translate>
            </v-btn>
          </span>
          <span v-else>
            <v-btn disabled flat color="primary" v-translate>Add credit card to change plan</v-btn>
          </span>
        </span>
      </div>
      <v-btn v-else color="primary" @click="() => changePlan({id: plan.id, type: 'SELECT_PLAN'})">
        <translate>Select</translate> &nbsp;{{ plan.name }}</v-btn>
    </div>
  </div>
</template>

<script>
import { get } from "lodash";
import moment from "moment";
export default {
  name: "SubscriptionPlan",
  props: ["plan", "selectedPlan", "changePlan", "hasDowngraded", "hasCreditCard"],
  computed: {
    planIsSelected() {
      if (this.selectedPlan) return this.selectedPlan.id === this.plan.id;
      else return false;
    },
    isFuturePlan() {
      return get(this, "hasDowngraded.futurePlan.id") === this.plan.id;
    },
    isOldPlan() {
      return get(this, "hasDowngraded.oldPlan.id") === this.plan.id;
    }
  },
  filters: {
    unixToDate: unix => moment(unix * 1000).format("DD.MM.YYYY")
  }
};
</script>

<style lang="stylus" scoped>
.price {
  font-size: 1.5em;
  font-weight: 700;
}

.plan-details {
  text-align: center;
  padding: 0.5em;
}

.plan-details.selected .inner {
  box-shadow: 4px 4px 21px -8px rgba(0, 0, 0, 0.4);
}

.plan-details .inner {
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding-bottom: 1em;
  background-color: white;
}

.inner-title {
  margin: 1em auto 0.5em auto;
}

.features {
  margin: 1em auto;
  width: 85%;
}

.min-height-features {
  min-height: 190px;
}

.features ul {
  padding: 0.5em;
}

.features li {
  list-style: none;
  text-align: left;
}

.bottom-border {
  border-bottom: 1px solid teal;
}

h6 {
  padding: 1em 1em 0.5em;
}

.current-plan {
  font-size: 0.55em;
  text-transform: uppercase;
  font-weight: 300;
  padding-top: 0.55em;
  letter-spacing: 1px;

  .subscription-info {
    font-size: 0.7em;
  }
}
</style>

