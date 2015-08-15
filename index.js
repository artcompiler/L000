/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
   L000 compiler service.
*/
var http = require('http');
var express = require('express')
var app = express();
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/pub'));
app.get('/', function(req, res) {
  res.send("Hello, L000!");
});
var compiler = require("./lib/compile.js");
// Graffiti Code will load the version of itself that matches the graffiti
// version. The compiler should use a version of itself that is compatible
// with the language version. This version object is returned along with
// the result of each /compile.
var version = {
  compiler: "v0.0.0",
  language: "v0.0.0",
  graffiti: "v0.0.0",
};
app.get('/version', function(req, res) {
  res.send(version);
});
app.get('/compile', function(req, res) {
  var data = "";
  req.on("data", function (chunk) {
    data += chunk;
  });
  req.on('end', function () {
    var src = JSON.parse(data).src;
    var obj = compiler.compile(src, function (err, val) {
      if (err.length) {
        res.send({
          error: err,
        });
      } else {
        res.send({
          data: val,
        });
      }
    });
  });
  req.on('error', function(e) {
    console.log(e);
    res.send(e);
  });
});
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
});
process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
});
