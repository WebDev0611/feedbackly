import { addPing } from 'state/ping';
import { PING_INTERVAL } from 'constants/pings';

let interval;

const syncPingerWithStore = store => {
  const { view } = store.getState();

  if (!view.isPreview) {
    store.dispatch(addPing());

    if(interval === undefined) {
      interval = setInterval(() => store.dispatch(addPing()), PING_INTERVAL);
    }
  }
}

export default syncPingerWithStore;
