<template>
<v-layout row>
          <v-flex xs12 sm3>
            <v-card class="pt-3 full-height elevation-0">

             <ChannelTree :channel-tree="channelTree | orderAlphabetically('name')"
             selection-mode="none" :channelgroup-on-click="setActiveChannelgroup"
             :highlighted-group="activeChannelgroup ? activeChannelgroup._id : ''"
              />
            </v-card>
          </v-flex>
          <v-flex xs12 sm9 class="ml-1">
            <v-card class="elevation-0 full-height">
              <v-card-title primary-title>
                <div v-if="!activeChannelgroup">
                 <div class="headline">
                  <translate>Channelgroups</translate>
                  </div>
                  <span class="grey--text">
                    <translate>Description and explanation...</translate>
                  </span>
                </div>
                <div v-else>
                 <div class="headline">
                  {{ activeChannelgroup.name }}
                  </div>
                </div>
                <div class="right">
                  <v-btn fab small ripple @click="actionTonewChannelgroup">
                    <v-icon>add</v-icon>
                  </v-btn>
                  <v-btn v-if="activeChannelgroup" @click="saveChannelgroup" fab small ripple dark class="teal">
                    <v-icon>save</v-icon>
                  </v-btn>
                  <v-btn v-if="!isNew" @click.stop="deleteDialog = true" fab small ripple dark class="red">
                    <v-icon>delete</v-icon>
                  </v-btn>
                </div>
              </v-card-title>
              <v-card-text v-if="activeChannelgroup != null">

              <PropRow :label="$gettext('Users with access')" :data="(activeChannelgroup.rightsToGroup || [] ).join(', ')" />

              <v-subheader>Details</v-subheader>

              <v-card class="elevation-0 grey lighten-4">
                <v-card-text>
                  <v-text-field :label="$gettext('Group name')" :value="activeChannelgroup.name" @input="value => setChannelgroupProp({path: 'name', value})"></v-text-field>
                </v-card-text>
              </v-card>
                 <v-subheader>
                   <translate>Members</translate>
                  </v-subheader>
                <v-card class="elevation-0 grey lighten-4 checkbox-list pl-4 pb-4">
                  <v-checkbox v-for="channel in channels" v-model="selectedChannels" :key="channel._id" :label="channel.name" :value="channel._id"></v-checkbox>
                </v-card>


              </v-card-text>

              <v-card-text v-else v-translate>
                No channelgroup selected
              </v-card-text>
            </v-card>
          </v-flex>
          <span v-if="false">
            <translate>Users with access</translate>
            <translate>Group name</translate>
          </span>

           <v-dialog v-model="deleteDialog" max-width="500px">
            <v-card>
              <v-card-title>
                <translate>Delete Channgelgroup</translate> &nbsp; {{activeChannelgroup.name}} ?
              </v-card-title>
              <v-card-text>
                <translate>Are you sure?</translate>
              </v-card-text>
            <v-card-actions>
              <v-btn color="red" dark @click="deleteGroup">Delete</v-btn>
              <v-btn flat @click.stop="deleteDialog = false">Cancel</v-btn>
            </v-card-actions>
            </v-card>
          </v-dialog>
</v-layout>

</template>

<script>
/* eslint-disable */
import {get} from 'lodash';
import PropRow from './PropRow';
import ChannelTree from './ChannelTree';
import { orderAlphabetically } from '../utils/filters';
export default {
  props: ['channelgroups',
  'channelTree',
  'setActiveChannelgroup',
  'activeChannelgroup',
  'channels',
  'setChannelgroupProp',
  'saveChannelgroup',
  'newChannelgroup',
  'deleteChannelgroup'
  ],
  components: {ChannelTree, PropRow},
  data(){
    return {
      deleteDialog: false
    }
  },
  computed: {
    isNew() {
      return !!!this.activeChannelgroup._id
    },
    selectedChannels: {
      get(){
        return this.activeChannelgroup.devices
      },
      set(ids){
        this.setChannelgroupProp({path: 'devices', value: ids})
      }
    }
  },
  filters: {
    orderAlphabetically
  },
  methods:{
    actionTonewChannelgroup(){
      this.newChannelgroup();
      this.$router.push({name: 'admin.Channelgroups'});
    },
    deleteGroup(){
      this.deleteChannelgroup();
      this.$set(this, "deleteDialog", false)
    }
  }

}
</script>

<style scoped>
.right{
  position: absolute;
  right: 10px;
}

.checkbox-list .input-group.input-group--selection-controls{
  height: 35px;
}

</style>
