<template>
  <v-dialog v-model="show" persistent max-width="500px">
    <v-card>
      <v-card-title class="headline" v-translate>
        Enter your billing info
      </v-card-title>
      <v-card-text>
        <translate>Enter your billing info for invoicing purposes</translate>

        <v-form v-model="valid">
          <v-select prepend-icon="group" :items="orgSizeItems" :value="billingInfo.organizationSize" :label="$gettext('Select organization size')" bottom @change="value => setOrganizationProp({path: 'billingInfo.organizationSize', value})" />
          <v-text-field :error-messages="errors.email" @blur="() => validate('email')" prepend-icon="email" :label="$gettext('Billing email')" :value="billingEmail" @input="value => setOrganizationProp({path: 'billingInfo.email', value})" required></v-text-field>
          <v-select :error-messages="errors.country" @blur="() => validate('country')" :items="countries" :value="billingInfo.country" :label="$gettext('Country')" autocomplete single-line auto prepend-icon="map" @change="value => { setOrganizationProp({path: 'billingInfo.country', value}); vatRequiredCheck() }"></v-select>
          <v-text-field :error-messages="errors.vatId" v-if="vatRequired" @blur="() => validate('vatId')" prepend-icon="label" :label="$gettext('VAT- or Business ID')" :value="billingInfo.vatId" @input="value => setOrganizationProp({path: 'billingInfo.vatId', value})" :required="vatRequired"></v-text-field>
          <v-text-field :error-messages="errors.address" @blur="() => validate('address')" prepend-icon="location_city" hint="Enter full address" :label="$gettext('Billing address')" :value="billingInfo.address" @input="value => setOrganizationProp({path: 'billingInfo.address', value})" multi-line></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn flat @click="close" v-translate>Cancel</v-btn>
        <v-btn color="primary" @click="saveForm" :loading="loading" :disabled="loading" v-translate>Save</v-btn>
      </v-card-actions>
    </v-card>
    <span style="display:none">
      <translate>Select organization size</translate>
      <translate>Billing email</translate>
      <translate>Country</translate>
      <translate>VAT- or Business ID</translate>
      <translate>Billing address</translate>
    </span>
  </v-dialog>
</template>

<script>
import { COUNTRIES, EU_COUNTRIES } from "@/constants/countries";
import { forEach, sum, map } from "lodash";
export default {
  name: "BillingInfo",
  props: ["billingInfo", "setOrganizationProp", "defaultEmail", "show", "submit", "close", "loading"],
  data() {
    return {
      countries: COUNTRIES,
      euCountries: EU_COUNTRIES,
      vatRequired: false,
      valid: false,
      errors: {
        email: [],
        country: [],
        vatId: [],
        address: []
      },
      orgSizeItems: [
        { text: this.$gettext("I am a private person"), value: "PRIVATE_PERSON" },
        { text: this.$gettext("0-10 employees"), value: "0-10" },
        { text: this.$gettext("10-100 employees"), value: "10-100" },
        { text: this.$gettext("100-1000 employees"), value: "100-1000" },
        { text: this.$gettext("1000+ employees"), value: "1000+" }
      ]
    };
  },
  computed: {
    billingEmail() {
      return this.billingInfo.email && this.billingInfo.email.length > 0
        ? this.billingInfo.email
        : this.defaultEmail;
    }
  },
  methods: {
    vatRequiredCheck() {
      const bool =
        this.euCountries.indexOf(this.billingInfo.country) > -1 &&
        this.billingInfo.organizationSize !== "PRIVATE_PERSON";
      this.$set(this, "vatRequired", bool);
    },
    validate(key) {
      if (key) this.errors[key] = [];
      else forEach(this.errors, (val, key) => (this.errors[key] = []));

      if (key == "email" || !key) {
        if (!this.billingInfo.email || this.billingInfo.email.length === 0)
          this.errors.email.push("Email is required");
        if (this.billingInfo.email.indexOf("@") == -1) this.errors.email.push("Email must be valid.");
      }

      if (key == "vatId" || !key) {
        if (this.vatRequired && (!this.billingInfo.vatId || this.billingInfo.vatId.length === 0))
          this.errors.vatId.push("VAT- or Business ID is required");
        if (this.vatRequired && (this.billingInfo.vatId.length > 0 && this.billingInfo.vatId.length < 4))
          this.errors.vatId.push("VAT- or Business ID is too short");
      }

      if (key == "address" || !key) {
        if (!this.billingInfo.address || this.billingInfo.address.length === 0)
          this.errors.address.push("Billing address is required");
      }

      if (key == "country" || !key) {
        if (!this.billingInfo.country || this.billingInfo.country.length == 0)
          this.errors.country.push("Country is required");
      }

      return sum(map(this.errors, val => val.length));
    },
    saveForm() {
      console.log(this.validate());
      if (this.validate() == 0) {
        this.submit();
      }
    }
  },
  mounted() {
    this.setOrganizationProp({ path: "billingInfo.email", value: this.billingEmail });
    this.vatRequiredCheck();
  }
};
</script>
