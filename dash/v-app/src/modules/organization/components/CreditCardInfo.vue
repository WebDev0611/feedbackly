<template>
  <v-dialog v-model="show" persistent max-width="500px">
    <v-card>
      <v-card-title class="headline" v-translate>
        Credit card
      </v-card-title>
      <v-card-text>
        <div class="text-xs-center" v-if="loading">
          <v-progress-circular indeterminate v-bind:size="50" color="primary"></v-progress-circular>
        </div>
        <form action="/charge" method="post" id="payment-form" :style="{display: `${loading ? 'none' : 'block'}`}">
          <div class="form-row pb-3">
            <label for="card-element" v-translate>
              Enter a credit card number. Entering a new credit card will replace previous ones on file.
            </label>
            <div id="card-element" class="pt-2">
              <!-- a Stripe Element will be inserted here. -->
            </div>

            <!-- Used to display form errors -->
            <div id="card-errors" role="alert"></div>
          </div>

          <button class="btn primary pa-2 " v-translate>Submit card details</button>
          <a class="btn flat pa-2" style="cursor: pointer;" @click="setShowDialog(false)" v-translate>Cancel</a>

        </form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "CreditCardInfo",
  props: ["show", "submitToken", "loading", "setLoadingState", "setShowDialog"],
  data() {
    return {};
  },
  mounted() {
    if (!window.Stripe) return;
    // eslint-disable-next-line
    const stripe = window.Stripe("pk_live_SfDQX8vBvzTRpupUDco1HOB3");

    // Create an instance of Elements
    const elements = stripe.elements();

    // Custom styling can be passed to options when creating an Element.
    // (Note that this demo uses a wider set of styles than the guide below.)
    const style = {
      base: {
        color: "#32325d",
        lineHeight: "24px",
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#aab7c4"
        }
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a"
      }
    };

    // Create an instance of the card Element
    const card = elements.create("card", { style });

    // Add an instance of the card Element into the `card-element` <div>
    card.mount("#card-element");

    // Handle real-time validation errors from the card Element.
    card.addEventListener("change", event => {
      const displayError = document.getElementById("card-errors");
      if (event.error) {
        displayError.textContent = event.error.message;
      } else {
        displayError.textContent = "";
      }
    });

    // Handle form submission
    const form = document.getElementById("payment-form");
    form.addEventListener("submit", event => {
      event.preventDefault();
      this.setLoadingState(true);

      stripe.createToken(card).then(result => {
        if (result.error) {
          // Inform the user if there was an error
          this.setLoadingState(false);
          const errorElement = document.getElementById("card-errors");
          errorElement.textContent = result.error.message;
        } else {
          // Send the token to your server
          this.submitToken(result.token);
        }
      });
    });
  }
};
</script>

<style scoped>
.StripeElement {
  background-color: white;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid transparent;
  box-shadow: 0 1px 3px 0 #e6ebf1;
  -webkit-transition: box-shadow 150ms ease;
  transition: box-shadow 150ms ease;
}

.StripeElement--focus {
  box-shadow: 0 1px 3px 0 #cfd7df;
}

.StripeElement--invalid {
  border-color: #fa755a;
}

.StripeElement--webkit-autofill {
  background-color: #fefde5 !important;
}
</style>
