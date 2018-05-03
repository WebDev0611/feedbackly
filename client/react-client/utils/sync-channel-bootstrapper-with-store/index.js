import * as kioskClient from 'utils/kiosk-client';

const syncChannelBootstrapperWithStore = store => {
  const { channel, build } = store.getState();
  const { udid, passcode } = channel;

  const buildAsInteger = parseInt(build);

  if(!isNaN(buildAsInteger) && buildAsInteger > 1600) {
    kioskClient.postMessage({ udid });
    kioskClient.postMessage({ passcode });
  }
}

export default syncChannelBootstrapperWithStore;
