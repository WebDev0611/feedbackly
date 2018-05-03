<template>

  <ul class="device-tree">
    <li v-for="group in channelTree" :key="group._id" class="group">
        <div class="caret" @click="toggleCollapsed(group._id)">
          <v-icon>{{ collapsed(group._id) ? 'keyboard_arrow_down': 'keyboard_arrow_right' }}</v-icon>
        </div>
        <v-checkbox v-if="selectionMode !== 'none'" :label="group.name" v-model="selectedGroups" :value="group" :indeterminate="getIndeterminateState(group)" hide-details></v-checkbox>
        <label v-else @click="() => selectGroup(group._id)" :class="highlightedGroup == group._id ? 'highlighted' : (channelgroupOnClick ? 'link' : '')">{{group.name}}</label>
        <ul v-if="collapsed(group._id) !== true">
          <li v-for="channel in group.devices" :key="channel._id">
            <v-icon class="small teal--text">{{getChannelTypeIcon(channel.type)}}</v-icon>
            <v-checkbox v-if="selectionMode == 'channel'" :label="channel.name" v-model="selectedChannels" :value="channel._id" hide-details></v-checkbox>
            <span v-else class="channel-label-without-checkbox">
              <label>{{channel.name}}</label>
            </span>
          </li>
        </ul>
    </li>
  </ul>

</template>


<script>
/* eslint-disable */
import { intersection, flatten, uniq, find } from 'lodash'
export default {
  name: 'ChannelTree',
  props: ['channelTree', 'selectionMode', 'selected', 'onChange', 'startCollapsed', 'channelgroupOnClick', 'highlightedGroup'],
  data(){
    return {
      collapsedElements: this.startCollapsed ? (this.channelTree || []).map(g => g._id) : []
    }
  },
  methods: {
    getIndeterminateState(group){
      if(this.selectionMode == 'channel'){
        const ids = group.devices.map(d => d._id);
        const inter = intersection(ids, this.selected);
        return inter.length > 0 && inter.length != ids.length
      } else return false;
    },
    collapsed(id){
      return this.collapsedElements.indexOf(id) > -1
    },
    toggleCollapsed(id){
      if(this.collapsed(id)) this.collapsedElements.splice(this.collapsedElements.indexOf(id), 1)
      else this.collapsedElements.push(id)
    },
    getChannelTypeIcon(channelType){
     const channelIcons = {
       'DEVICE': 'tablet',
       'QR': 'smartphone',
       'LINK': 'link',
       'PLUGIN': 'code',
       'EMAIL': 'email',
       'SMS': 'message'
     }

     return channelIcons[channelType]
    },
    selectGroup(id){
      this.channelgroupOnClick({id})
    }
  },
  computed: {
    selectedGroups: {
      set(selectedGroupsArray){
        
        if(this.selectionMode === 'group'){
          this.onChange(selectedGroupsArray.map(g => g._id))
        }
        if(this.selectionMode === 'channel'){
          const selectedIds = flatten(selectedGroupsArray.map(group => group.devices.map(d => d._id)));
          let newSelected = uniq([...this.selected, ...selectedIds])
          if(this.selected.length == newSelected.length) newSelected = selectedIds;
          this.onChange(newSelected)
        }
      },
      get(){
        if(this.selectionMode === 'group'){
          return (this.selected || []).map(id => find(this.channelTree, {_id: id}));
        }
        if(this.selectionMode === 'channel'){
          const selectedGroupsFromDevices = []
          this.channelTree.forEach(group => {
            const ids = group.devices.map(d => d._id);
            if(intersection(ids, this.selected).length == ids.length){
              selectedGroupsFromDevices.push(group)
            }
          });
          return selectedGroupsFromDevices;
        }
      }
    },

    selectedChannels: {
      set(channels){
        if(this.selectionMode == 'channel'){
          this.onChange(channels)
        }
      },
      get(){
        if(this.selectionMode == 'group'){
          return flatten(this.selectedGroups.map(group => group.devices.map(d => d._id)))
        }
        if(this.selectionMode == 'channel') return this.selected;
      }
    }
  }

}
</script>


<style scoped>
    li {
      list-style: none;
      padding: 0;
    }

    li.group{
      position: relative;
    }

    li .checkbox{
      padding: 0;
    }

    .caret{
      position: absolute;
      cursor: pointer;
      left: -22px;
      top: -1px;
    }

    label.highlighted:hover, label.link:hover{
      text-decoration: underline;
      cursor: pointer;
    }

    label.highlighted{
        font-weight: 700;
    }
</style>
<style>

  .device-tree .input-group__input{
    min-height: 20px; 
  }
  .device-tree .input-group__input i{
    font-size: 18px;
  }
  .device-tree .input-group--selection-controls__ripple{
      width: 30px !important;
      height: 30px !important;
      -webkit-transform: translate3d(-6px, -50%, 0);
      transform: translate3d(-6px, -50%, 0);
  }
  .device-tree .input-group--selection-controls__ripple:before{
    width: 22.5px !important;
    height: 22.5px !important;
  }
  .device-tree .input-group label{
      font-size: 12px;
      line-height: inherit;
      height: 19px;
  }

  .small{
    font-size: 15px;
  }

  .channel-label-without-checkbox{
    color: rgba(0,0,0,0.54);
    font-size: 12px;
  }

</style>
