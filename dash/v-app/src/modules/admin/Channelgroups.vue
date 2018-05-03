<template>
  <ChannelgroupsComponent
    :channel-tree="channelTree | noAllChannels"
    :channelgroups="channelgroups | noAllChannels"
    :active-channelgroup="activeChannelgroup"
    :set-active-channelgroup="setActiveChannelgroup"
    :set-channelgroup-prop="setChannelgroupProp"
    :save-channelgroup="saveChannelgroup"
    :channels="channels"
    :new-channelgroup="NEW_CHANNELGROUP"
    :delete-channelgroup="deleteChannelgroup"
      />
</template>

<script>
/* eslint-disable */
import {mapState, mapMutations, mapActions} from 'vuex';
import {find} from 'lodash';
import ChannelgroupsComponent from '../../components/ChannelgroupsComponent';
import { SET_CHANNELGROUP_PROP, SAVE_CHANNELGROUP, NEW_CHANNELGROUP, DELETE_CHANNELGROUP, GET_ORGANIZATION_BY_ID } from './constants';
import { NAMESPACE } from './store'
export default {
  name: 'Channelgroups',
  components: {ChannelgroupsComponent},
  computed: {
    ...mapState(NAMESPACE, {
      channelgroups: state => state.activeOrganization.channelGroups,
      channels: state => state.activeOrganization.channels,
      channelTree: state => state.activeOrganization.channelTree,
      newChannelgroup: state => state.channelgroups.newChannelgroup,
    }),
    ...mapState('route', {
      channelgroupId: state => state.params.channelgroupId
    }),
    isNew(){
       return this.channelgroupId == undefined
    },
    activeChannelgroup(){
       return this.isNew ? this.newChannelgroup : find(this.channelgroups, {_id: this.channelgroupId})
    },
  },
  methods: {
    ...mapMutations(NAMESPACE, [
      SET_CHANNELGROUP_PROP,
      NEW_CHANNELGROUP
    ]),
    ...mapActions(NAMESPACE, [
      SAVE_CHANNELGROUP,
      DELETE_CHANNELGROUP,
      GET_ORGANIZATION_BY_ID
    ]),
    setActiveChannelgroup: function(id){ this.$router.push({name: 'admin.Channelgroups.edit', params: {channelgroupId: id.id}}) },
    setChannelgroupProp(payload){ this[SET_CHANNELGROUP_PROP]({...payload, id: this.channelgroupId, isNew: this.isNew})},
    async saveChannelgroup(){
      self =this;
      this[SAVE_CHANNELGROUP]({id: this.channelgroupId, isNew: this.isNew })
      .then(function(id){
        self.setActiveChannelgroup({id})
      })
    },
    async deleteChannelgroup(){
      const orgid = this.activeChannelgroup.organization_id
      await this[DELETE_CHANNELGROUP]({id: this.activeChannelgroup._id})
      this.$router.push({name: 'admin.Channelgroups'})
      this[NEW_CHANNELGROUP]()
      this[GET_ORGANIZATION_BY_ID]({payload: {id: orgid}})

    }
  },
  filters: {
    noAllChannels: dgs => (dgs || []).filter(dg => !dg.is_all_channels_group)
  }


}
</script>

<style>

</style>

