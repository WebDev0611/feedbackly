function find(arr, obj, returnWidthIndex = false) {
  var keys = Object.keys(obj);

  var target = undefined;
  var targetIndex = -1;

  arr.forEach(function(elem, index) {
    var match = false;

    keys.forEach(function(key) {
      if(elem[key] === obj[key]) {
        match = true;
      } else {
        match = false;
      }
    });

    if(match === true) {
      targetIndex = index;
      target = elem;

      return;
    }
  });

  return returnWidthIndex === false ? target : { target, index: targetIndex };
}

module.exports = { find: find };
