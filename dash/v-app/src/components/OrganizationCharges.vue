<template>
  <v-layout row wrap>
    <h5 v-translate>Billing history</h5>
    <v-data-table v-bind:headers="headers" :items="charges.charges" hide-actions class="elevation-1">
      <template slot="items" slot-scope="props">
        <td>{{ props.item.date | date }}</td>
        <td class="text-xs-right">{{ props.item.total }} €</td>
        <td class="text-xs-right">
          <v-btn flat @click="() => printInvoice(props.item)">
            <v-icon>print</v-icon> &nbsp; <translate>Print</translate>
          </v-btn>
        </td>
      </template>
    </v-data-table>

  </v-layout>
</template>

<script>
import { mapActions, mapState, mapMutations } from "vuex";
import { GET_ORGANIZATION_CHARGES, SET_ORGANIZATION_CHARGES, SET_PRINT_INVOICE } from "@/constants/main";
import moment from "moment";
export default {
  props: ["organizationId", "billingInfo"],
  data() {
    return {
      headers: [
        { text: this.$gettext("Date"), sortable: false, align: "left" },
        { text: this.$gettext("Total"), sortable: false },
        { text: this.$gettext("Invoice"), sortable: false }
      ]
    };
  },
  created() {
    this.GET_ORGANIZATION_CHARGES({ organizationId: this.organizationId });
  },
  methods: {
    ...mapActions([GET_ORGANIZATION_CHARGES, SET_ORGANIZATION_CHARGES]),
    ...mapMutations([SET_PRINT_INVOICE]),
    printInvoice(charge) {
      this[SET_PRINT_INVOICE]({ charge, billingInfo: this.billingInfo });
      const self = this;
      setTimeout(() => {
        window.print();
        setTimeout(() => {
          self[SET_PRINT_INVOICE](undefined);
        }, 3000); 
      }, 1000);
    }
  },
  computed: {
    ...mapState({
      charges: state => state.organizationCharges
    })
  },
  filters: {
    date: unix => moment(unix * 1000).format("DD.MM.YYYY HH.mm")
  }
};
</script>

<style scoped lang="stylus">
</style>
