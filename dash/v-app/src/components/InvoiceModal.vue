<template>
  <v-layout row wrap class="main pa-2" align-center>
    <v-flex xs4 sm4 md2 class="pt-4 pb-4">
      <img src="/images/logos/feedbackly-logo-rgb.png">
      <p class="text-xs-left">
        Feedbackly Oy <br /> Itämerenkatu 1, 00180 Helsinki FINLAND
      </p>
    </v-flex>

    <v-flex xs12>
      <h4 v-translate>Invoice</h4>

      <v-flex class="text-xs-right bold">
        <p># {{charge.id}}
          <br /> {{charge.date | date}}
          <br /> {{ charge.source }}
        </p>
        <p>
          <br /> {{ billingInfo.name }}
          <br /> {{ billingInfo.billingInfo.vatId }}
          <br />
          <span v-html="(billingInfo.billingInfo.address || '').split('\n').join('<br />')" />
          <br /> {{ billingInfo.billingInfo.country }}
        </p>
      </v-flex>
    </v-flex>

    <v-flex xs12>
      <table class="table">
        <thead>
          <th v-for="heading in headings" :key="heading">{{heading}}</th>
        </thead>
        <tbody>
          <tr v-for="(line,i) in charge.lines" :key="i">
            <td>{{line.description}}</td>
            <td>{{line.quantity}}</td>
            <td>{{line.amount}} €</td>
            <td>{{charge.tax_percent || 0}} %</td>
            <td>{{ line.total - line.amount | round}} €</td>
            <td>{{line.total}} €</td>
          </tr>
        </tbody>
      </table>
      <v-flex class="text-xs-right bold pt-2">
        <p v-if="charge.starting_balance"><translate>Discount</translate>: {{ charge.starting_balance }} €</p>
        <p v-if="charge.discount"><translate>Discount</translate>: {{ charge.discount }} €</p>
        <p><translate>Price without tax</translate>: {{ charge.price_without_tax }} €</p>
        <p><translate>Tax</translate>: {{ charge.tax }} €</p>
        <p>
          <translate>TOTAL PAID</translate>: {{charge.total}} €
        </p>
      </v-flex>

    </v-flex>

  </v-layout>

</template>

<script>
import moment from "moment";
export default {
  data() {
    return {
      headings: [
        this.$gettext("Description"),
        this.$gettext("Quantity"),
        this.$gettext("Amount"),
        this.$gettext("Tax percent"),
        this.$gettext("Tax"),
        this.$gettext("Total")
      ]
    };
  },
  props: ["charge", "billingInfo"],
  filters: {
    date: str => moment(str * 1000).format("YYYY-MM-DD"),
    round: number => Math.round(number * 100) / 100
  }
};
</script>

<style scoped lang="stylus">
.main {
  background-color: #fff;
}

img {
  width: 100%;
}

.bold {
  font-weight: 400;
}

.table {
  width: 100%;
}
</style>
