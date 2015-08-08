/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/* Copyright (c) 2015, Art Compiler LLC */

import {assert, message, messages, reserveCodeRange} from "./assert.js"

reserveCodeRange(1000, 1999, "compile");
messages[1001] = "Node ID %1 not found in pool.";
messages[1002] = "Invalid tag in node with Node ID %1.";
messages[1003] = "No aync callback provided.";
messages[1004] = "No visitor method defined for '%1'.";

let translate = function() {
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
    assert(typeof resume === "function", message(1003));
    // Get the node from the pool of nodes.
    let node = nodePool[nid];
    assert(node, message(1001, [nid]));
    assert(node.tag, message(1001, [nid]));
    assert(typeof table[node.tag] === "function", message(1004, [node.tag]));
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

let render = function() {
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

export let compiler = function () {
  exports.compile = function compile(pool, resume) {
    // Compiler takes an AST in the form of a node pool and translates it into
    // an object to be rendered on the client by the viewer for this language.
    try {
      translate(pool, function (err, data) {
        console.log("translate data=" + JSON.stringify(data, null, 2));
        if (err) {
          resume(err, data);
        } else {
          render(data, function (err, data) {
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
