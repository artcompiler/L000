/*
   L000 compiler service.
   @flow weak
*/
var express = require('express')
var compiler = require("./lib/compile.js");
var app = express();
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/pub'));
app.get("/.well-known/acme-challenge/S4EDKpiNxlbJT1sGyWksMQ28FXJdXcn553EhoINNW-U", function(req, res) {
  res.send("S4EDKpiNxlbJT1sGyWksMQ28FXJdXcn553EhoINNW-U.Fzpon67yOJjoArf9Yosy2tR5vF2zLd5fJ3tSglCuLoI");
});
app.get('/', function(req, res) {
  res.send("Hello, L000!");
});
app.get("/version", function(req, res) {
  res.send(compiler.version ? compiler.version : "v0.0.0");
});
app.get("/compile", function(req, res) {
  let body = "";
  req.on("data", function (chunk) {
    body += chunk;
  });
  req.on('end', function () {
    body = JSON.parse(body);
    let code = body.src;
    let data = body.data;
    let obj = compiler.compile(code, data, function (err, val) {
      if (err.length) {
        res.send({
          error: err,
        });
      } else {
        res.json(val);
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
