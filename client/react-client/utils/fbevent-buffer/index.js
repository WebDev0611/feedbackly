import * as storage from 'utils/storage';

const storageKey = '_feedbacklyFbevents';

export function pushToBuffer(fbevent) {
  let fbevents = storage.get(storageKey) || [];
  let newFbevents = [...fbevents, fbevent];

  storage.set(storageKey, newFbevents);

  return newFbevents;
}

export function getBuffer() {
  return storage.get(storageKey) || [];
}

export function removeFromBuffer(id) {
  let fbevents = storage.get(storageKey) || [];

  storage.set(storageKey, fbevents.filter(fbevent => fbevent._id !== id));
}
