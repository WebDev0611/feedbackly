import _ from 'lodash';
let toaster = null;
export function setToaster(_toaster) {
  toaster = _toaster
}
export default function() {
  return toaster;
}
