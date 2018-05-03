<template>
  <v-layout row justify-center>
    <v-dialog v-model="dialog" persistent max-width="500px">
      <v-card>
        <v-card-text>
          <v-card-text>
            <v-card-title>
              <span class="headline">One more thing...</span>
            </v-card-title>
            <v-card-text>
              <v-layout row wrap>
                <v-flex xs12>
                  When a friend or colleague signs up to Feedbackly using your referral link, you
                  will both get a $10 credit to your account (if they choose a paid plan) or a Feedbackly
                  t-shirt/hoodie (if 5 choose a free plan)."
                </v-flex>
                <v-card-text class="px-0">
                  <v-layout row wrap>
                    <v-flex xs6 class="mt-2">
                      {{link}}
                    </v-flex>
                    <v-flex xs3></v-flex>
                    <v-flex xs2>
                      <v-btn color="green" small dark @click.native="copy">COPY</v-btn>
                    </v-flex>
                  </v-layout>
                </v-card-text>
                <v-flex xs12>
                  Or type in e-mail to notify them directly
                </v-flex>
                <v-card-text class="px-0 pb-0">
                  <v-flex xs12>
                    <v-text-field label="Type in an e-mail" v-model="toEmail"></v-text-field>
                  </v-flex>
                </v-card-text>
              </v-layout>
            </v-card-text>
            <v-card-actions class="py-0">
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" flat @click.native="dialog = false">Close</v-btn>
              <v-btn color="blue darken-1" flat @click.native="send">Send</v-btn>
            </v-card-actions>
          </v-card-text>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
  import { mapMutations, mapState, mapActions } from "vuex";
  import { NAMESPACE } from "../store";
  import { POST_POPUP, GET_UNIQUE_LINK } from "../constants";
  import store from '../store'

  export default {
    name: 'popup',
    data () {
      return {
        dialog: true,
        toEmail: '',
        link: '',
        name: 'Feedbackly',
        myEmail: 'noreply@feedbackly.com',
        info: {...this.$store.state.signup.organizationDetails}

      }
    },
    mounted() {
      console.log('----- Popup mounted -----')
      this.generate()
    },
    methods: {
      ...mapActions(NAMESPACE, [POST_POPUP, GET_UNIQUE_LINK]),
      send: function () {
          if(!this.link)
              return

        const data = {
          name: this.info.name,
          toEmail: this.toEmail,
          link: this.link,
          myEmail: this.info.email
        };

        this[POST_POPUP](data)
      },
      copy: function () {
        console.log(this.link)
      },
      generate: function () {
        const that = this
        this[GET_UNIQUE_LINK]({email: this.info.email}).then((v) => {
          if(v.link)
            that.link = v.link
        })
      }
    },
  }
</script>
<style>
  .headline {
    color: green;
    font-style: oblique;
  }

</style>
