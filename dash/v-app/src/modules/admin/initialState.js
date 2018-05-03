/* eslint-disable */
import {pick} from 'lodash';
import { SAVE_STATUS_DONE } from './constants';

const initialStatus = {
  saveStatus: SAVE_STATUS_DONE,
  organizations: [],
  activeOrganization: {
    organization: {
      name: '',
      segment: 'SOLUTION_SALES',
      profanityFilter: ''
    }
  },
  users: {
    newUser: {
      isNew: true,
      settings: {
        locale:'en'
      },
      rights: {
        rights: {
          devicegroups: []
        }
      }
    }
  },
  channels: {
    newChannel: {
      name: '',
      type: 'DEVICE',
      isNew: true,
    }
  },
  channelgroups: {
    newChannelgroup: {
      isNew: true,
      devices: []
    }
  },
}

export default function(attributes){
  if(attributes) return {...pick(initialStatus, attributes.split(" "))};
  else return {...initialStatus}
}
