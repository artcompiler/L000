"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validate = exports.encodeID = exports.decodeID = exports.reserveCodeRange = exports.messages = exports.message = exports.assert = undefined;

var _hashids = require("hashids");

var _hashids2 = _interopRequireDefault(_hashids);

var _https = require("https");

var _https2 = _interopRequireDefault(_https);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2013 Art Compiler LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
  ASSERTS AND MESSAGES

  We use the 'assert()' function to trap invalid states of all kinds. External
  messages are distinguished from internal messages by a numeric prefix that
  indicates the error code associated with the message. For example, the
  following two asserts implement an internal and external assert, respectively.

     assert(false, "This code is broken.");
     assert(false, "1001: Invalid user input.");

  To aid in the writing of external messages, we keep them in a single global
  table named 'messages'. Each module adds to this table its own messages
  with an expression such as

     messages[1001] = "Invalid user input.";

  These messages are accessed with the 'message' function as such

     message(1001);

  Calling 'assert' with 'message' looks like

     assert(x != y, message(1001));

  ALLOCATING ERROR CODES

  In order to avoid error code conflicts, each module claims a range of values
  that is not already taken by the modules in the same system. A module claims
  a range of codes by calling the function reserveCodeRange() like this:

     reserveCodeRange(1000, 1999, "mymodule");

  If the requested code range has any values that are already reserved, then
  an assertion is raised.

  USAGE

  In general, only allocate message codes for external asserts. For internal
  asserts, it is sufficient to simply inline the message text in the assert
  expression.

  It is good to write an assert for every undefined state, regardless of whether
  it is the result of external input or not. Asserts can then be externalized if
  and when they it is clear that they are the result of external input.

  A client module can override the messages provided by the libraries it uses by
  simply redefining those messages after the defining library is loaded. That is,
  the client can copy and past the statements of the form

     messages[1001] = "Invalid user input.";

  and provide new text for the message.

     messages[1001] = "Syntax error.";

  In the same way different sets of messages can be overridden for the purpose
  of localization.

*/

var messages = {};
var reservedCodes = [];
var ASSERT = true;
var assert = function () {
  return !ASSERT ? function () {} : function (val, str) {
    if (str === void 0) {
      str = "failed!";
    }
    if (!val) {
      var err = new Error(str);
      throw err;
    }
  };
}();

var message = function message(errorCode) {
  var args = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

  var str = messages[errorCode];
  if (args) {
    args.forEach(function (arg, i) {
      str = str.replace("%" + (i + 1), arg);
    });
  }
  return errorCode + ": " + str;
};

var reserveCodeRange = function reserveCodeRange(first, last, moduleName) {
  assert(first <= last, "Invalid code range");
  var noConflict = reservedCodes.every(function (range) {
    return last < range.first || first > range.last;
  });
  assert(noConflict, "Conflicting request for error code range");
  reservedCodes.push({ first: first, last: last, name: moduleName });
};

var hashids = new _hashids2.default("Art Compiler LLC"); // This string shall never change!
var decodeID = function decodeID(id) {
  // console.log("[1] decodeID() >> " + id);
  // 123456, 123+534653+0, Px4xO423c, 123+123456+0+Px4xO423c, Px4xO423c+Px4xO423c
  if (id === undefined) {
    id = "0";
  }
  if (Number.isInteger(id)) {
    id = "" + id;
  }
  if (Array.isArray(id)) {
    // Looks like it is already decoded.
    assert(Number.isInteger(id[0]) && Number.isInteger(id[1]));
    return id;
  }
  assert(typeof id === "string", "Invalid id " + id);
  id = id.replace(/\+/g, " ");
  var parts = id.split(" ");
  var ids = [];
  // Concatenate the first two integer ids and the last hash id. Everything
  // else gets erased.
  for (var i = 0; i < parts.length; i++) {
    var n = void 0;
    if (ids.length > 2) {
      // Found the head, now skip to the last part to get the tail.
      ids = ids.slice(0, 2);
      i = parts.length - 1;
    }
    if (Number.isInteger(n = +parts[i])) {
      ids.push(n);
    } else {
      ids = ids.concat(hashids.decode(parts[i]));
    }
  }
  // Fix short ids.
  if (ids.length === 1) {
    ids = [0, ids[0], 0];
  } else if (ids.length === 2) {
    ids = [0, ids[0], 113, ids[1], 0];
  } else if (ids.length === 3 && ids[2] !== 0) {
    ids = [ids[0], ids[1], 113, ids[2], 0];
  }
  // console.log("[2] decodeID() << " + JSON.stringify(ids));
  return ids;
};

var encodeID = function encodeID(ids) {
  // console.log("[1] encodeID() >> " + JSON.stringify(ids));
  var length = ids.length;
  if (length >= 3 &&
  // [0,0,0] --> "0"
  +ids[length - 3] === 0 && +ids[length - 2] === 0 && +ids[length - 1] === 0) {
    ids = ids.slice(0, length - 2);
    length = ids.length;
  }
  if (length === 1) {
    if (+ids[0] === 0) {
      return "0";
    }
    ids = [0, +ids[0], 0];
  } else if (length === 2) {
    ids = [0, +ids[0], 113, +ids[1], 0];
  }
  var id = hashids.encode(ids);
  // console.log("[2] encodeID() << " + id);
  return id;
};

function postAuth(path, data, resume) {
  var encodedData = JSON.stringify(data);
  var options = {
    host: "auth.artcompiler.com",
    port: "443",
    path: path,
    method: "POST",
    headers: {
      'Content-Type': 'text/plain',
      'Content-Length': Buffer.byteLength(encodedData)
    }
  };
  var req = _https2.default.request(options);
  req.on("response", function (res) {
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
  req.on('error', function (err) {
    console.log("ERROR " + err);
    resume(err);
  });
}
var validated = {};
function validate(token, resume) {
  if (token === undefined) {
    resume(null, {
      address: "guest",
      access: "compile"
    });
  } else if (validated[token]) {
    console.log("validate() validated[token]=" + JSON.stringify(validated[token]));
    resume(null, validated[token]);
  } else {
    postAuth("/validate", {
      jwt: token
    }, function (err, data) {
      validated[token] = data;
      resume(err, data);
    });
  }
}

exports.assert = assert;
exports.message = message;
exports.messages = messages;
exports.reserveCodeRange = reserveCodeRange;
exports.decodeID = decodeID;
exports.encodeID = encodeID;
exports.validate = validate;