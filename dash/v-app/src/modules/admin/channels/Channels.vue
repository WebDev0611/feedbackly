<template>
<v-layout row>
      <v-flex xs12 sm3>
        <ChannelList :channels="channels" :select-active-channel="selectActiveChannel" :active-channel-id="activeChannel._id" />
      </v-flex>

      <v-flex xs 12 sm9>
          <ChannelInfo v-if="activeChannel" :channel="activeChannel" :change-prop="changeProp" context="admin" />
      </v-flex>
      
      <div class="right">

        <v-btn fab small ripple @click="newChannelClick">
              <v-icon>add</v-icon>
        </v-btn>
        <v-btn fab small ripple dark @click="saveChannel" :loading="saving" :disabled="saving" class="teal">
            <v-icon>save</v-icon>
        </v-btn>
        <v-btn fab small ripple dark @click.stop="deleteChannelPrompt = true" :loading="saving" :disabled="saving" color="red" v-if="!activeChannel.isNew">
            <v-icon>delete</v-icon>
        </v-btn>
      </div>


      <v-dialog v-model="deleteChannelPrompt" max-width="500px">
      <v-card>
        <v-card-title>
          Delete channel ? 
        </v-card-title>
        <v-card-text>
         Deleting channel. OK?
        </v-card-text>
      <v-card-actions>
        <v-btn color="red" dark @click="deleteChannel">Delete</v-btn>
        <v-btn @click.stop="deleteChannelPrompt=false">Cancel</v-btn>
      </v-card-actions>
      </v-card>
    </v-dialog>
</v-layout>
</template>


<script>
/* eslint-disable */
import {mapState, mapMutations, mapActions} from 'vuex';
import {find} from 'lodash';
import {NAMESPACE} from '../store';
import ChannelInfo from '../../../components/ChannelInfo';
import ChannelList from './ChannelList';
import {SET_CHANNEL_PROP, SAVE_CHANNEL, SAVE_STATUS_SAVING, NEW_CHANNEL, DELETE_CHANNEL, GET_ORGANIZATION_BY_ID} from '../constants';

  export default {
      name: 'Channels',
      components: {ChannelInfo, ChannelList},
      data(){
        return {
          deleteChannelPrompt: false
        }
      },
      computed: {
        ...mapState(NAMESPACE, {
          saving: state => state.saveStatus == SAVE_STATUS_SAVING,
          channels: state => state.activeOrganization.channels,
          newChannel: state => state.channels.newChannel
          }),
        ...mapState('route', {
          channelId: state => state.params.channelId,
          route: state => state.name
        }),
        activeChannel(){
          const channel = find(this.channels, {_id: this.channelId})
          if(!channel) return this.newChannel
          else return find(this.channels, {_id: this.channelId})
        }
      
      },
      methods: {
        ...mapMutations(NAMESPACE, {
          SET_CHANNEL_PROP,
          NEW_CHANNEL
          }),
        ...mapActions(NAMESPACE, [
          SAVE_CHANNEL,
          DELETE_CHANNEL,
          GET_ORGANIZATION_BY_ID
        ]),
        saveChannel(){
          var self = this;
          this[SAVE_CHANNEL]({id: this.channelId, isNew: this.activeChannel.isNew}).then(function(id){
            if(typeof id === 'string') self.$router.push({name: 'admin.Channels.edit', params: {channelId: id}})})
        },
        selectActiveChannel(props){
          const {id} = props;
          this.$router.push({name: 'admin.Channels.edit', params: {channelId: id}})
        },
        changeProp(input){
            this[SET_CHANNEL_PROP]({...input, id: this.channelId, isNew: this.activeChannel.isNew})   
        },
        newChannelClick(){
            this[NEW_CHANNEL]();
            this.$router.push({name: 'admin.Channels'})
        },
        async deleteChannel(){
            this.$set(this, "deleteChannelPrompt", false);
            const orgid = this.activeChannel.organization_id;
            await this[DELETE_CHANNEL]({id: this.channelId})
            this.newChannelClick()
            this[GET_ORGANIZATION_BY_ID]({payload: {id: orgid}})
        }
      },

      beforeRouteEnter(to, from, next){
        next(vm => vm[NEW_CHANNEL]())
      },
      beforeRouteUpdate(to, from, next){
        this[NEW_CHANNEL]();
        next()
      }
  }


</script>

<style scoped>
.list__tile__action{
  min-width: 35px;
}

.right{
  position: absolute;
  right: 10px;
}
</style>