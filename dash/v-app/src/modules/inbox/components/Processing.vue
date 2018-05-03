<template>
  <div>
  <v-layout justify-end>
    <v-flex xs12 sm10 md8>
      <div class="processed">

        <div class="timestamp">
          <span v-if="event.type=='unprocess'" v-translate>Unprocessed by</span>
          <span v-if="event.type=='process'" v-translate>Processed by</span>

          {{event.created_by.displayname}}
          <translate>at</translate> {{event.created_at | date}}
          <span v-if="event.group_id">
            <translate>in user group </translate>
            {{event.group_id}}
          </span>
        </div>
      </div>
    </v-flex>
  </v-layout>
  </div>
</template>


<script>
import {date} from "@/utils/filters"
export default {
  props: ["event"],
  filters: {date}
};
</script>

<style scoped lang="stylus">

.processed{
  font-weight: 400;
  }
.timestamp {
  text-align: right;
  font-size: 0.8em;
}
</style>
