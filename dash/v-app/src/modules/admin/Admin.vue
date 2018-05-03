<template>
  <div>
    <div class="top">
      <v-btn fab dark small class="teal" @click.native.stop="organizationsModal = true">
        <v-icon>add</v-icon>
      </v-btn>
    </div>
    <!-- Create Organization Modal -->
    <v-dialog v-model="organizationsModal" max-width="290">
      <v-card>
        <v-card-title class="headline" v-translate>Create a new organization</v-card-title>
        <v-form v-model="form.valid">
            <v-text-field
              :label="$gettext('Organization name')"
              v-model="form.organizationName"
              :rules="form.organizationNameRules"
              required
            >
            </v-text-field>
            <v-select
              v-bind:items="form.segments"
              v-model="form.segment"
              :label="$gettext('Select')"
              single-line
              :hint="$gettext('Segment')"
              persistent-hint
              bottom
            ></v-select>
        </v-form>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" flat="flat" @click.native="createOrganization()" v-translate>Create</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <organizations :organizations="organizations"></organizations>
    <span style="display:none;">
      <translate>Organization name</translate>
      <translate>Select</translate>
      <translate>Segment</translate>
    </span>
  </div>
</template>

<script>
/* eslint-disable */
import { mapState, mapActions } from 'vuex'
import Toolbar from './Toolbar.vue';
import Organizations from './Organizations';
import {GET_ORGANIZATIONS, CREATE_NEW_ORGANIZATION} from './constants';
import {NAMESPACE} from './store';

export default {
  name: NAMESPACE,
  components: {Toolbar, Organizations},
  created: function(){
    this.GET_ORGANIZATIONS()
  },
  methods: {
     ...mapActions(NAMESPACE, [
      GET_ORGANIZATIONS, // map `this.increment()` to `this.$store.dispatch('increment')`
      CREATE_NEW_ORGANIZATION
     ]),
     createOrganization(){
       if (this.form.valid !== false) {
         this.organizationsModal = false;
         this.CREATE_NEW_ORGANIZATION({name: this.form.organizationName, segment:this.form.segment});
         this.$nextTick(()=> this.GET_ORGANIZATIONS());
       }
     }
  },
  computed: {
    ...mapState(NAMESPACE, [
    'organizations'
    ])
  },
  data() {
    return {
      form: {
        segment: "SOLUTION_SALES",
        segments: [
          "SOLUTION_SALES",
          "TEST",
          "SELF_SIGNUP"
        ],
        valid: false,
        organizationName: "",
        organizationNameRules: [
        (v) => !!v || this.$gettext("Name is required")
        ],
      },
      organizationsModal: false
    };
  }
}
</script>

<style scoped>
.top{
  padding-bottom: 1em;
  text-align: right;
}

form {
  margin: 1rem;
}
</style>
