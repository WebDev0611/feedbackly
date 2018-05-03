var phantom = require('phantom');
var phridge = require('phridge');

function pngCreator(options){
  // {address: 'url', clipRect: {left: 0, top: 0, width: 700, height: 300}}
  var phantom;
  return phridge.spawn().then(ph => {
    phantom = ph;
    phantom.onError = (msg, trace) => { console.log(trace) };
		return ph.openPage(options.address);
  })
  .then(page => {
    page.onError = (msg, trace) => { console.log(trace) };
    return page.run(function (resolve) {
        resolve(this.renderBase64('PNG'));
		});
  })
  .then(imageData => {
    if(phantom) phantom.dispose();
    return imageData;
  })
}


module.exports = {pngCreator}
