(function() {
    "use strict";
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
    "use strict";
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

    let $$assert$$location = "";
    const $$assert$$messages = {};
    const $$assert$$reservedCodes = [];
    let $$assert$$ASSERT = true;
    let $$assert$$assert = (function () {
      return !$$assert$$ASSERT ?
        function () { } :
        function (val, str) {
          if ( str === void 0 ) {
            str = "failed!";
          }
          if ( !val ) {
            let err = new Error(str);
            err.location = $$assert$$location;
            throw err;
          }
        }
    })();

    let $$assert$$message = function (errorCode, args) {
      let str = $$assert$$messages[errorCode];
      if (args) {
        args.forEach(function (arg, i) {
          str = str.replace("%" + (i + 1), arg);
        });
      }
      return errorCode + ": " + str;
    };

    let $$assert$$reserveCodeRange = function (first, last, moduleName) {
      $$assert$$assert(first <= last, "Invalid code range");
      let noConflict = $$assert$$reservedCodes.every(function (range) {
        return last < range.first || first > range.last;
      });
      $$assert$$assert(noConflict, "Conflicting request for error code range");
      $$assert$$reservedCodes.push({first: first, last: last, name: moduleName});
    }

    let $$assert$$setLocation = function (location) {
      //assert(location, "Empty location");
      location = loc;
    }

    let $$assert$$clearLocation = function () {
      $$assert$$location = null;
    }

    let $$assert$$setCounter = function (n, message) {
      count = n;
      countMessage = message ? message : "ERROR count exceeded";
    }

    let $$assert$$checkCounter = function () {
      if (typeof count !== "number" || isNaN(count)) {
        $$assert$$assert(false, "ERROR counter not set");
        return;
      }
      $$assert$$assert(count--, countMessage);
    }

    $$assert$$reserveCodeRange(1000, 1999, "compile");
    $$assert$$messages[1001] = "Node ID %1 not found in pool.";
    $$assert$$messages[1002] = "Invalid tag in node with Node ID %1.";
    $$assert$$messages[1003] = "No aync callback provided.";
    $$assert$$messages[1004] = "No visitor method defined for '%1'.";

    let $$src$compile$$translate = function() {
      function print(str) {
        console.log(str);
      }
      let nodePool;
      function translate(pool, resume) {
        print("pool=" + JSON.stringify(pool, null, 2));
        nodePool = pool;
        return visit(pool.root, {}, resume);
      }
      function visit(nid, options, resume) {
        $$assert$$assert(typeof resume === "function", $$assert$$message(1003));
        // Get the node from the pool of nodes.
        let node = nodePool[nid];
        $$assert$$assert(node, $$assert$$message(1001, [nid]));
        $$assert$$assert(node.tag, $$assert$$message(1001, [nid]));
        $$assert$$assert(typeof table[node.tag] === "function", $$assert$$message(1004, [node.tag]));
        return table[node.tag](node, options, resume);
      }
      // BEGIN VISITOR METHODS
      let edgesNode;
      function str(node, options, resume) {
        let val = node.elts[0];
        resume(null, val);
      }
      function num(node, options, resume) {
        let val = node.elts[0];
        resume(null, val);
      }
      function ident(node, options, resume) {
        let val = node.elts[0];
        resume(null, val);
      }
      function bool(node, options, resume) {
        let val = node.elts[0];
        resume(null, val);
      }
      function list(node, options, resume) {
        visit(node.elts[0], options, function (err, val) {
          if (!(val instanceof Array)) {
            val = [val];
          }
          resume(null, val);
        });
      }
      function program(node, options, resume) {
        if (!options) {
          options = {};
        }
        visit(node.elts[0], options, resume);
      }
      function exprs(node, options, resume) {
        if (node.elts && node.elts.length) {
          visit(node.elts[0], options, function (err, val) {
            node.elts.shift();
            exprs(node, options, function (err, data) {
              data.push(val);
              resume(null, data);
            });
          });
        } else {
          resume(null, []);
        }
      };
      let table = {
        "PROG" : program,
        "EXPRS" : exprs,
        "STR": str,
        "NUM": num,
        "IDENT": ident,
        "BOOL": bool,
        "LIST" : list,
      }
      return translate;
    }();

    let $$src$compile$$render = function() {
      function escapeXML(str) {
        return String(str)
          .replace(/&(?!\w+;)/g, "&amp;")
          .replace(/\n/g, " ")
          .replace(/\\/g, "\\\\")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");
      }
      function render(node, resume) {
        resume(null, node);
      }
      return render;
    }();

    let $$src$compile$$compiler = function () {
      exports.compile = function compile(pool, resume) {
        // Compiler takes an AST in the form of a node pool and translates it into
        // an object to be rendered on the client by the viewer for this language.
        try {
          $$src$compile$$translate(pool, function (err, data) {
            console.log("translate data=" + JSON.stringify(data, null, 2));
            if (err) {
              resume(err, data);
            } else {
              $$src$compile$$render(data, function (err, data) {
                console.log("render data=" + JSON.stringify(data, null, 2));
                resume(err, data);
              });
            }
          });
        } catch (x) {
          console.log("ERROR with code");
          console.log(x.stack);
          resume("Compiler error", {
            score: 0
          });
        }
      }
    }();
}).call(this);