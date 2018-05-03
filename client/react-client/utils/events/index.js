import zepto from 'npm-zepto';
import { delay } from 'lodash';

import store from 'state/store';

export function onTap(callback, options = {}) {
  const { view } = store.getState();

  let decoratedCallback = e => callback(e);

  if (options.applyActiveClass === true) {
    decoratedCallback = (e) => {
      const target = zepto(e.target).closest('.tapable');
      target.addClass('tap-active');
      target.removeClass('tap-inactive');

      callback(e);
    };
  } else {
    decoratedCallback = (e) => {
      const target = zepto(e.target).closest('.tapable');
      target.removeClass('tap-active');
      target.addClass('tap-inactive');

      callback(e);
    };
  }

  return !view.decorators.IPAD || view.isPreview
    ? { onClick: decoratedCallback }
    : { onTouchStart: decoratedCallback };
}

export function getTapEventName() {
  const { view } = store.getState();

  return !view.decorators.IPAD || view.isPreview ? 'click' : 'touchstart';
}

export function hideKeyboard(element) {
  element.attr('readonly', 'readonly');
  element.attr('disabled', 'true');

  return new Promise((resolve, reject) => {
    delay(() => {
      element.blur();
      element.removeAttr('readonly');
      element.removeAttr('disabled');

      resolve();
    }, 100);
  });
}

export function getEventX(e) {
  return e.clientX || e.changedTouches[0].pageX || e.originalEvent.changedTouches[0].pageX;
}

export function getEventY(e) {
  return e.clientY || e.changedTouches[0].pageY || e.originalEvent.changedTouches[0].pageY;
}
