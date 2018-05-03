function xdr(url, method, data, callback, errback) {
    var req;

    if(XMLHttpRequest) {
        req = new XMLHttpRequest();
        if('withCredentials' in req) {
            req.open(method, url, true);
            req.setRequestHeader('Content-Type', 'application/json');
            req.onerror = errback;
            req.onreadystatechange = function() {
                if (req.readyState === 4) {
                    if (req.status >= 200 && req.status < 400) {
                        callback(req.responseText);
                    } else {
                        errback(new Error('Response returned with non-OK status'));
                    }
                }
            };
            req.send(data);
        }
    } else if(XDomainRequest) {
        req = new XDomainRequest();
        req.open(method, url);
        req.setRequestHeader('Content-Type', 'application/json');
        req.onerror = errback;
        req.onload = function() {
            callback(req.responseText);
        };
        req.send(data);
    } else {
        errback(new Error('CORS not supported'));
    }
}

function get(url, succ, err) {
  xdr(url, 'GET', {}, function(res) {
    succ(JSON.parse(res));
  }, err);
}

function post(url, data, succ, err) {
  xdr(url, 'POST', JSON.stringify(data), function(res) {
    succ(res);
  }, err);
}

module.exports = { get, post };
