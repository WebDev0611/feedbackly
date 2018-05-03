import { camelCase } from 'lodash';

export function getTextFillId(label, id) {
  return `${camelCase(label)}-${id}`;
}

export function updateTextFillOnElements(selector, textFillOptions = {}) {
  if(textFillOptions.textFillEnabled === false) return;
  selector
    .removeAttr('style');

  selector
    .parent()
    .removeAttr('style')
    .textfill(Object.assign({ changeLineHeight: true }, textFillOptions));
}
