var Timer = require('../../app/utils/timer');

var $elem = $('#timer-screen');
var disabled = false;

$elem
  .on('touchstart click', () => resetTimer());

function init() {
  $elem.show();

  Timer.onChange(onTimerChange);
}

function disable() {
  disabled = true;
}

function enable() {
  disabled = false;
}

function destroy() {
  $elem.hide();
}

function resetTimer() {
  $elem.removeClass('show');
  Timer.setValue(window.SURVEY_RETURN_TIME);
}

function show() {
  if(disabled) return;

  $elem.addClass('show');
}

function hide() {
  $elem.removeClass('show');
}

function onTimerChange(value) {
  if(value <= 7) {
    show();
  } else {
    hide();
  }

  $elem.find('.timer-screen-counter-value').html(value);
}

module.exports = { init, destroy, hide, show, disable, enable }
