/*
   L000 compiler service.
   @flow weak
*/
const https = require("https");
const express = require('express')
const compiler = require("./lib/compile.js");
const app = express();
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

function postAuth(path, data, resume) {
  let encodedData = JSON.stringify(data);
  var options = {
    host: "auth.artcompiler.com",
    port: "443",
    path: path,
    method: "POST",
    headers: {
      'Content-Type': 'text/plain',
      'Content-Length': Buffer.byteLength(encodedData),
    },
  };
  var req = https.request(options);
  req.on("response", (res) => {
    var data = "";
    res.on('data', function (chunk) {
      data += chunk;
    }).on('end', function () {
      try {
        resume(null, JSON.parse(data));
      } catch (e) {
        console.log("ERROR " + data);
        console.log(e.stack);
      }
    }).on("error", function () {
      console.log("error() status=" + res.statusCode + " data=" + data);
    });
  });
  req.end(encodedData);
  req.on('error', function(err) {
    console.log("ERROR " + err);
    resume(err);
  });
}

const validated = {};
function validate(token, resume) {
  if (token === undefined) {
    resume(null, {
      address: "guest",
      access: "compile",
    });
  } else if (validated[token]) {
    resume(null, validated[token]);
  } else {
    postAuth("/validate", {
      jwt: token
    }, (err, data) => {
      validated[token] = data;
      resume(err, data);
    });
  }
}

app.get("/compile", function(req, res) {
  let body = "";
  req.on("data", function (chunk) {
    body += chunk;
  });
  req.on('end', function () {
    body = JSON.parse(body);
    let auth = body.auth;
    validate(auth, (err, data) => {
      if (err) {
        res.send(err);
      } else {
        let code = body.src;
        let data = body.data;
        let t0 = new Date;
        let obj = compiler.compile(code, data, function (err, val) {
          if (err.length) {
            res.send({
              error: err,
            });
          } else {
            console.log("GET /compile " + (new Date - t0) + "ms");
            res.json(val);
          }
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
