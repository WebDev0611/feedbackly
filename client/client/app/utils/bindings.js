var setBindings = function(elements, fn){
  $(document).on("touchstart", ".ipad " + elements, fn);
  $(document).on("click", ".no-ipad " + elements + ", .ipad.preview " + elements, fn);
}


var clearBindings = function(elements, fn){
  $(document).off("touchstart", ".ipad " + elements);
  $(document).off("click", ".no-ipad " + elements + ", .ipad.preview " + elements);
}


module.exports = {setBindings, clearBindings}
