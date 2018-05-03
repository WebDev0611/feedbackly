export function postMessage(message) {
  if(parent && typeof parent.postMessage === 'function') {
    parent.postMessage(JSON.stringify(message), '*');
  }
}
