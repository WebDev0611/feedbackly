var INITIAL_VALUE = 0;
var TICK_INTERVAL = 1000;
var lastValue;
var interval;
var value = INITIAL_VALUE;
var onChangeCallbacks = [];

function tick() {
  if(value > 0) {
    value--;
    changed();
  }
}

function setValue(newValue) {
  value = newValue;
  lastValue = newValue;
  changed();
}

function getValue() {
  return value;
}

function running(){
   return interval !== undefined
}

function start() {
  if(interval === undefined) {
    interval = setInterval(() => tick(), TICK_INTERVAL);
  }
}

function stop() {
  if(interval !== undefined) {
    clearInterval(interval);
    interval = undefined;
  }
}

function restart(){
  value = lastValue;
}

function reset() {
  stop();
  value = INITIAL_VALUE;
  onChangeCallbacks = [];
}

function changed() {
  onChangeCallbacks.forEach(callback => callback(value));
}

function onChange(callback) {
  onChangeCallbacks.push(callback);
}


module.exports = { stop, start, restart, setValue, getValue, onChange, running };
