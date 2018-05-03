<template>
  <v-card-text class="field">
    <div style="padding: 16px" v-if="type==='email'">
      <v-text-field :label="subjectLabel" v-model="form.subject"></v-text-field>
    </div>
    <v-text-field :label="textLabel" v-model="form.data" rows="3" full-width multi-line ></v-text-field>

    <v-card-actions class="actions">
      <v-btn color="teal" @click.prevent="reply" :disabled="disabled" :dark="!disabled">
        <v-icon>{{icon}}</v-icon>
        &nbsp; &nbsp;
        <translate v-if="type === 'note'">Add internal note</translate>
        <translate v-if="type === 'sms'">Send SMS reply</translate>
        <translate v-if="type === 'email'">Send E-mail reply</translate>

      </v-btn>
    </v-card-actions>

  </v-card-text>
</template>

<script>
export default {
  data() {
    return {
      form: {
        data: "",
        subject: ""
      }
    };
  },
  methods: {
    reply() {
      if(this.form.data.length === 0) return;
      if(this.type === 'email' && this.form.subject.length === 0) return;
      this.POST_REPLY({
        id: this.id,
        form: {
          data: this.form.data,
          type: this.type,
          subject: this.form.subject
        }
      });

      this.$set(this, "form", { data: "", subject: "" });
    }
  },
  props: ["POST_REPLY", "contact", "type", "id"],
  computed: {
    textLabel() {
      if (this.type === "note") return this.$gettext("Type a note");
      if (this.type === "sms") return this.$gettext("Type an SMS response");
      if (this.type === "email") return this.$gettext("Type an email response");
    },
    subjectLabel() {
      return this.$gettext("Email subject");
    },
    icon() {
      if (this.type === "note" || this.type === "email") return this.type;
      else return "message";
    },
    disabled(){
      if(this.form.data.length === 0) return true;
      if(this.type === 'email' && this.form.subject.length === 0) return true;
      return false;
    }
  }
};
</script>
<style lang="stylus" scoped>
.actions {
  border-top: 1px solid #f1f1f1;
}
</style>

