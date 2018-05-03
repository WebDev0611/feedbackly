require('./set-env')
var express = require('express');
var app = express();
var path = require('path')
var childProcess = require('child_process')
var phantomjs = require('phantomjs-prebuilt')
var binPath = phantomjs.path
var upload = require('./s3')
var pngCreator = require('./controllers/png_creator').pngCreator;
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));

var port = process.env.PORT || 80;
app.use(express.static('exports'));

app.get('/health', function(req, res){
  res.send('Healthy')
})

app.get('/png', (req, res) => {
  var q = req.query;
  var options = {
    clipRect: {top: q.top, left: q.left, width: q.width, height: q.height},
    targetUrl: q.address
  }

  var url = Math.random().toString(36).substring(7) +'/feedbackly-digest' + Date.now() +'.png'

  pngCreator(options)
  .then(base64Data => fs.writeFileAsync("out.png", base64Data, 'base64'))
  .then(() => upload.uploadToAmazonPromise("out.png", url))
  .then(a => {
     console.log('successfully uploaded to ' + a)
     res.send(a)
   })
  .catch(err => res.status(500).send({error: err}))
})

app.get('/', function (req, res) {
  var addr = req.query.address;
  var token = req.query.token
  console.log(req.query)
  if(token != "feedbackly") return res.status(401).send("Unauthorized");
  var url = Math.random().toString(36).substring(7) +'/feedbackly-' + Date.now() +'.pdf'
	var childArgs = [
	  'rasterize.js',
	  addr,
		"exports/"+url,
		'A4',
		0.25
	];

  console.log("creating PDF at " + url);

	childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
	  // handle results
		console.log(err)
		console.log(stdout)
		console.log(stderr);
		if(err){
      res.status(500).send({error: err})
    } else {
      var file = __dirname + '/exports/' + url;
      upload.uploadToAmazonPromise(file, url)
      .then(a => {
         console.log('successfully uploaded to ' + a)
         res.send(a)
       })
      .catch(err => res.status(500).send({error: err}))
    }
	})

});

app.listen(port, function () {
  console.log('PDF SERVICE app listening on port' + port);
});
