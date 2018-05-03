import { pick } from "lodash";
import { SAVE_STATUS_DONE } from "../constants";

const initialState = {
  saveStatus: SAVE_STATUS_DONE,
  loadStatus: false,
  organizations: [],
  activeOrganization: {
    organization: {
      name: "",
      segment: "SOLUTION_SALES"
    },
    smsBalance: 0
  },
  users: {
    newUser: {
      isNew: true,
      settings: {
        locale: "en"
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
      name: "",
      type: "DEVICE",
      isNew: true
    }
  },
  channelgroups: {
    newChannelgroup: {
      isNew: true,
      devices: []
    }
  }
};

export default function(attributes) {
  if (attributes) return { ...pick(initialState, attributes.split(" ")) };
  return { ...initialState };
}
