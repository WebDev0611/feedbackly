<template>
  <v-card>
    <v-card-text>
      <div v-if="allowMeta && displayScreen==0" class="center">
        <h6 v-translate>Are you going to use metadata?</h6>
        <div class="subheader" v-translate>Metadata allows to add details such as personalization data to each feedback. It is useful when your data contains identification data such as customer ids etc.</div>
        <div class="mt-4"></div>
        <v-btn color="teal" v-translate>Yes</v-btn>
        <v-btn v-translate translate-comment="No -- ei,nej">No</v-btn>
      </div>

      <div v-if="allowMeta && displayScreen==1" class="center">
        <h6 v-translate>Please specify all metadata fields your excel/csv-file contains.</h6>

        <div class="mt-4"></div>

        <div class="chips">
          <v-chip v-for="(field, i) in this.metaFields" @input="() => removeMeta(i)" :key="i" close>{{field}}</v-chip>
        </div>
        <v-layout row>
          <v-flex xs3>
            <v-subheader>
               <translate>Metadata field name</translate>
            </v-subheader>
          </v-flex>
          <v-flex xs6>
            <v-text-field v-model="metaFieldName" :label="$gettext('Enter field name')"></v-text-field>
          </v-flex>
          <v-flex xs3>
            <v-btn flat color="primary" @click="addMetaField">
              <v-icon>add</v-icon> &nbsp; <span v-translate>Add</span>
            </v-btn>
          </v-flex>
        </v-layout>

        <v-btn color="teal" :dark="metaFields.length > 0" :disabled="metaFields.length === 0" @click="displayScreen = 2">Done</v-btn>
        <v-btn>Cancel</v-btn>
      </div>

      <div v-if="!allowMeta || displayScreen==2">
        <xls-csv-parser class="parser" :columns="fileColumns" @onValidate="onValidate" :help="help" lang="en"></xls-csv-parser>
        <br><br>
        <div class="results" v-if="results">
          <h3 v-translate>Results:</h3>
          <pre>{{ JSON.stringify(results, null, 2) }}</pre>
        </div>
      </div>
    </v-card-text>
    <span style="display:none">
      <translate>Enter field name</translate>
    </span>
  </v-card>
</template>

<script>
import { XlsCsvParser } from "vue-xls-csv-parser";
import { uniq } from "lodash";
export default {
  name: "Csv",
  components: {
    XlsCsvParser
  },
  props: ["previousMeta"],
  methods: {
    onValidate(results) {
      this.results = results;
    },
    addMetaField() {
      if (this.metaFieldName.length > 0) {
        this.metaFields.push(this.metaFieldName);
        this.$set(this, "metaFieldName", "");
      }
    },
    removeMeta(i) {
      const newArr = [...this.metaFields];
      newArr.splice(i, 1);
      this.$set(this, "metaFields", newArr);
    }
  },
  data() {
    return {
      allowMeta: true,
      displayScreen: 1,
      metaFieldName: "",
      metaFields: [],
      columns: [
        { name: "Student login", value: "login" },
        { name: "Student firstname", value: "firstname" },
        { name: "Student lastname", value: "lastname" },
        { name: "Other", value: "other", isOptional: true }
      ],
      results: null
    };
  },
  computed: {
    fileColumns() {
      return [
        ...this.columns,
        ...this.metaFields.map(name => {
          return { name, value: name, isOptional: true };
        })
      ];
    },
    help() {
      const fields = this.fileColumns
        .filter(c => !c.isOptional)
        .map(c => c.name)
        .join(", ");
      return `Necessary columns are: ${fields}`;
    }
  },
  created() {
    this.$set(this, "metaFields", this.previousMeta);
  },
  watch: {
    previousMeta() {
      this.metaFields = uniq([...this.previousMeta, ...this.metaFields]);
    }
  }
};
</script>

<style lang="stylus">
.parser {
  table {
    td {
      text-align: center;
    }
  }

  .row {
    .col-md-6 {
      display: inline-block;
      width: 49%;
      padding: 1em;
    }
  }

  a.header-tool {
    padding: 1em;
    text-decoration: none;
    border: 1px solid #009688;
    color: #009688;
  }

  .btn {
    padding: 0 1em;

    &.btn-primary {
      color: white;
      background-color: #009688 !important;
    }
  }

  .dropzone-area {
    height: 120px !important;
  }
}
</style>

<style scoped >
.center {
  text-align: center;
}

.text-left {
  text-align: left;
}

.chips {
  min-height: 40px;
}

.italic {
  font-style: italic;
}
</style>
