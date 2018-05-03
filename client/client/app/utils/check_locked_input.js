function locked(){
  return $(".current-question .input").attr("locked") == "true"
}

function lock(){
  $(".current-question .input").attr("locked", "true")
}

function unlock(){
  $(".current-question .input").attr("locked", "")
}

function trigger(cb){
  if(!locked()){
    lock();
    cb();
  }
}

function unlockAll(){
  $(".input").attr("locked", "");
}

module.exports = {locked, lock, unlock, trigger}
