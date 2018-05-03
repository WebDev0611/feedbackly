<template>
  <v-layout justify-end>
    <v-flex xs12 sm10 md9 class="text-xs-right">
      <div :class="'message ' + event.message.type">
        <span v-html="message"></span>
        <div class="timestamp pt-2">
          <translate v-if="event.message.type === 'email'">Email</translate>
          <translate v-if="event.message.type === 'sms'">SMS</translate>
          <translate v-if="event.message.type === 'note'">Internal note</translate>

          <translate translate-comment="by a person"> by</translate>
          {{event.created_by.displayname}}
          <translate translate-comment="at a date">at</translate> {{event.created_at | date}}</div>
      </div>
    </v-flex>
  </v-layout>
</template>
<script>
import { date } from "@/utils/filters";
export default {
  props: ["event"],
  filters: { date },
  computed: {
    message() {
      return this.event.message.message.split("\n").join("<br />");
    }
  }
};
</script>

<style scoped lang="stylus">
.message {
  padding: 1em;
  border-radius: 1em;
  text-align: right;
  display: inline-block;
}

.note {
  border-color: #e8dac9;
  background-color: #fff7ef;
}

.email, .sms {
  background-color: #f7f7f7;
}

.timestamp {
  text-align: right;
  font-size: 0.8em;
}
</style>
