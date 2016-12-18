/*
   L000 compiler service.

   @flow weak
*/
var fs = require('fs');
var http = require('http');
var express = require('express')
var app = express();
app.set('port', (process.env.PORT || 5000));
app.set('views', __dirname);
app.use(express.static(__dirname + '/pub'));
app.get('/', function(req, res) {
  res.send("Hello, L000!");
});

// LetsEncript acme challenge
app.get('/.well-known/acme-challenge/Fat9s216-BheFxzOVTCk2BpbQqDEnE_Jh49sAZFAxgo', function(req, res) {
  res.send("Fat9s216-BheFxzOVTCk2BpbQqDEnE_Jh49sAZFAxgo.Fzpon67yOJjoArf9Yosy2tR5vF2zLd5fJ3tSglCuLoI");
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
app.get('/view/:id', function(req, res) {
  var id = req.params.id;
  item(id, function (err, data) {
    var obj = JSON.parse(data)[0].obj;
    res.render('view.html', {
      obj: JSON.stringify(obj),
    }, function (error, html) {
      if (error) {
        console.log("error=" + error.stack);
        res.send(400, error);
      } else {
        res.send(html);
      }
    });
/*
    if (err && err.length) {
      res.send({
        error: err,
      });
    } else {
      res.send(obj);
    }
*/
  });
  function item(id, resume) {
    var options = {
      method: "GET",
      host: "www.graffiticode.com",
      path: "/code/" + id,
    };
    var req = http.get(options, function(res) {
      var data = "";
      res.on('data', function (chunk) {
        data += chunk;
      }).on('end', function () {
        try {
          resume(null, data);
        } catch (e) {
          console.log("ERROR: " + e.stack);
        }
      }).on("error", function () {
        resume("ERROR status=" + res.statusCode + " data=" + data, null);
      });
    });
  }
});
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
});
process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
});
