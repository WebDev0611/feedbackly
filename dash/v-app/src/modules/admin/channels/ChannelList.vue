<template>
      <v-card class="full-height elevation-0">
        <v-list>
          <v-list-tile>
            <v-text-field single-line v-model="filter" append-icon="search"></v-text-field>
          </v-list-tile>
          <list-stagger height="56px">
            <v-list-tile v-for="channel in channelList" :key="channel._id" :class="selectedClass(channel._id)" @click="selectActiveChannel({id: channel._id})">
              <v-list-tile-action>
                <v-icon class="teal--text">tablet</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title v-text="channel.name"></v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </list-stagger>
        </v-list>
      </v-card>
</template>

<script>
/* eslint-disable */
export default {
  props: ['channels', 'selectActiveChannel', 'activeChannelId'],
  computed: {
    channelList(){
        return (this.channels || []).filter(u => u.name.toLowerCase().indexOf(this.filter.toLowerCase()) > -1)
    }
  },
  data(){
    return {
      filter: ''
    }
  },
  methods: {
    selectedClass(id){
      return this.activeChannelId == id ? 'grey lighten-3' : ''
    }
  }
}
</script>

<style>

</style>
