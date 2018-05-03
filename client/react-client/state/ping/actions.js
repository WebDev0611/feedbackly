export const ADD_PING = 'ADD_PING';
export const SAVE_PING = 'SAVE_PING';
export const SAVE_PING_SUCCESS = 'SAVE_PING_SUCCESS';

import * as kioskClient from 'utils/kiosk-client';

export function addPing() {
  return (dispatch, getState) => {
    const { ping, channel } = getState();

    var pl = { action: "ping", deviceId: channel._id, latestRefresh: ping.latestRefresh }

    return dispatch(savePing(pl))
    .then(a => {
      if(a.type === "SAVE_PING_SUCCESS"){
        kioskClient.postMessage({ deviceReporting: 'true' });
      } else {
        kioskClient.postMessage(pl)
      }
    });
  }
}

export function savePing(ping) {
  return {
    type: SAVE_PING,
    payload: {
      request: {
        url: `/ping/${ping.deviceId}/${ping.latestRefresh}`,
        method: 'get'
      }
    }
  }
}
