import { startsWith } from 'lodash';

export function getQueryParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

export function toValidUrl(url = '') {
  return startsWith(url, 'http://') || startsWith(url, 'https://')
    ? url
    : `http://${url}`;
}

export function redirect(url) {
  if(typeof url === 'string' && (startsWith(url, 'http://') || startsWith(url, 'https://'))) {
    window.location.replace(url);
  }
}
