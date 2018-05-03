(function(){
var _FblyInst = {};
var _FblyShallow = function _FblyShallow(name) {
  return Fbly.prototype[name] = function() {
      this.queue.push([name, arguments]);
    };
};

function Fbly(udid) {
  this.queue = [];
  this.udid = udid;
  var instanceId = udid + (new Date().getTime() + Math.floor(Math.random() * 1000));
  _FblyInst[instanceId] = this;
}

var _fbly_methods = ['open', 'close', 'addMeta', 'removeMeta']
for(var i=0; i< _fbly_methods.length; i++){
  _FblyShallow(_fbly_methods[i])
}

var _fbly_fn = function _fbly_fn() {
  (function(url) {
      var script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.defer = true;
      script.src = url;
      var el = document.getElementsByTagName("body")[0] || document.getElementsByTagName("head")[0];
      el.appendChild(script);
  })(process.env.CLIENT_URL + '/dist/plugin-v2.min.js?id=' + new Date().getTime());
};
if (_FblyInst) {
  _fbly_fn();
}

window.Fbly = Fbly;
window._FblyInst = _FblyInst;
})()
