var $modal = $('#privacy-policy-modal');
var $layer = $('#privacy-policy-layer');
var Bindings = require('./../../app/utils/bindings');

var translationChangeToken;

function init() {
  Bindings.setBindings("#privacy-policy-open", () => show());
  Bindings.setBindings(".privacy-policy-close",() => hide());

  updateTranslation(window.currentLanguage);

  translationChangeToken = PubSub.subscribe('CHANGE_LANGUAGE', (msg, translation) => {
    updateTranslation(translation);
  })
}

function show() {
  $modal.show();
  $layer.show();
}

function hide() {
  $modal.hide();
  $layer.hide();
}

function destroy() {
  PubSub.unsubscribe(translationChangeToken);
  Bindings.clearBindings("#privacy-policy-open");
  Bindings.clearBindings("#privacy-policy-close");
}

function updateTranslation(translation) {
  $('.privacy-policy-container').hide();

  if(translation === 'fi') {
    $('#privacy-policy-container-fi').show();
  } else {
    $('#privacy-policy-container-en').show();
  }
}

module.exports = { init, destroy };
