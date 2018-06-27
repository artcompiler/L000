"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.compiler = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; }; /* Copyright (c) 2016, Art Compiler LLC */


var _share = require("./share.js");

(0, _share.reserveCodeRange)(1000, 1999, "compile");
_share.messages[1001] = "Node ID %1 not found in pool.";
_share.messages[1002] = "Invalid tag in node with Node ID %1.";
_share.messages[1003] = "No async callback provided.";
_share.messages[1004] = "No visitor method defined for '%1'.";

var transform = function () {
  var table = {
    // v1
    "PROG": program,
    "EXPRS": exprs,
    "STR": str,
    "NUM": num,
    "IDENT": ident,
    "BOOL": bool,
    "LIST": list,
    "RECORD": record,
    "BINDING": binding,
    "ADD": add,
    "MUL": mul,
    "VAL": val,
    "KEY": key,
    "LEN": len,
    "STYLE": styleV1,
    "CONCAT": concat,
    "ARG": arg,
    "IN": inData,
    "LAMBDA": lambda,
    "PAREN": paren,
    "APPLY": apply,
    "MAP": map
  };
  var nodePool = void 0;
  var version = void 0;
  function node(nid) {
    return nodePool[nid];
  }
  function getVersion(pool) {
    return pool.version ? +pool.version : 0;
  }
  function transform(code, data, resume) {
    nodePool = code;
    version = getVersion(code);
    return visit(code.root, data, resume);
  }
  function error(str, nid) {
    return {
      str: str,
      nid: nid
    };
  }
  function visit(nid, options, resume) {
    (0, _share.assert)(typeof resume === "function", (0, _share.message)(1003));
    // Get the node from the pool of nodes.
    var node = void 0;
    if (!nid) {
      resume([], null);
      return;
    } else if ((typeof nid === "undefined" ? "undefined" : _typeof(nid)) === "object") {
      node = nid;
    } else {
      node = nodePool[nid];
    }
    (0, _share.assert)(node, (0, _share.message)(1001, [nid]));
    (0, _share.assert)(node.tag, (0, _share.message)(1001, [nid]));
    (0, _share.assert)(typeof table[node.tag] === "function", (0, _share.message)(1004, [JSON.stringify(node.tag)]));
    return table[node.tag](node, options, resume);
  }
  // BEGIN VISITOR METHODS
  function str(node, options, resume) {
    var val = node.elts[0];
    resume([], val);
  }
  function num(node, options, resume) {
    var val = node.elts[0];
    resume([], +val);
  }
  function ident(node, options, resume) {
    var word = findWord(options, node.elts[0]);
    resume([], word && word.val || node.elts[0]);
  }
  function bool(node, options, resume) {
    var val = node.elts[0];
    resume([], !!val);
  }
  function concat(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      var str = "";
      if (val1 instanceof Array) {
        val1.forEach(function (v) {
          str += v;
        });
      } else {
        str = val1.toString();
      }
      resume(err1, str);
    });
  }
  function paren(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      resume(err1, val1);
    });
  }
  function list(node, options, resume) {
    if (node.elts && node.elts.length > 1) {
      visit(node.elts[0], options, function (err1, val1) {
        node = {
          tag: "LIST",
          elts: node.elts.slice(1)
        };
        list(node, options, function (err2, val2) {
          var val = [].concat(val2);
          val.unshift(val1);
          resume([].concat(err1).concat(err2), val);
        });
      });
    } else if (node.elts && node.elts.length > 0) {
      visit(node.elts[0], options, function (err1, val1) {
        var val = [val1];
        resume([].concat(err1), val);
      });
    } else {
      resume([], []);
    }
  }
  function inData(node, options, resume) {
    var data = options.data ? options.data : [];
    resume([], data);
  }
  function arg(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      var key = val1;
      if (false) {
        err1 = err1.concat(error("Argument must be a number.", node.elts[0]));
      }
      resume([].concat(err1), options.args[key]);
    });
  }
  function args(node, options, resume) {
    resume([], options.args);
  }
  function enterEnv(ctx, name, paramc) {
    if (!ctx.env) {
      ctx.env = [];
    }
    // recursion guard
    if (ctx.env.length > 380) {
      //return;  // just stop recursing
      throw new Error("runaway recursion");
    }
    ctx.env.push({
      name: name,
      paramc: paramc,
      lexicon: {},
      pattern: []
    });
  }
  function exitEnv(ctx) {
    ctx.env.pop();
  }
  function findWord(ctx, lexeme) {
    var env = ctx.env;
    if (!env) {
      return null;
    }
    for (var i = env.length - 1; i >= 0; i--) {
      var word = env[i].lexicon[lexeme];
      if (word) {
        return word;
      }
    }
    return null;
  }
  function addWord(ctx, lexeme, entry) {
    topEnv(ctx).lexicon[lexeme] = entry;
    return null;
  }
  function topEnv(ctx) {
    return ctx.env[ctx.env.length - 1];
  }
  function lambda(node, options, resume) {
    // Return a function value.
    visit(node.elts[0], options, function (err0, params) {
      var args = [].concat(options.args);
      enterEnv(options, "lambda", params.length);
      params.forEach(function (param, i) {
        var inits = nodePool[node.elts[3]].elts;
        if (args[i]) {
          // Got an arg so use it.
          addWord(options, param, {
            name: param,
            val: args[i]
          });
        } else {
          // Don't got an arg so use the init.
          visit(inits[i], options, function (err, val) {
            addWord(options, param, {
              name: param,
              val: val
            });
          });
        }
      });
      visit(node.elts[1], options, function (err, val) {
        // let env = topEnv(options);
        // let lexicon = env.lexicon;
        // Object.keys(lexicon).forEach(n => {
        //   // Reflect local bindings into the generator object.
        //   val[n] = String(lexicon[n].val);
        // });
        exitEnv(options);
        resume([].concat(err0).concat(err).concat(err), val);
      });
    });
  }
  function apply(node, options, resume) {
    // Apply a function to arguments.
    visit(node.elts[1], options, function (err1, args) {
      options.args = args;
      visit(node.elts[0], options, function (err0, val) {
        exitEnv(options);
        resume([].concat(err0), val);
      });
    });
  }
  function map(node, options, resume) {
    // Apply a function to arguments.
    visit(node.elts[1], options, function (err1, argsList) {
      // args
      var errs = [];
      var vals = [];
      argsList.forEach(function (args) {
        options.args = args;
        visit(node.elts[0], options, function (err, val) {
          vals.push(val);
          errs = errs.concat(err);
        });
      });
      resume(errs, vals);
    });
  }
  function binding(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      visit(node.elts[1], options, function (err2, val2) {
        resume([].concat(err1).concat(err2), { key: val1, val: val2 });
      });
    });
  }
  function record(node, options, resume) {
    if (node.elts && node.elts.length > 1) {
      visit(node.elts[0], options, function (err1, val1) {
        node = {
          tag: "RECORD",
          elts: node.elts.slice(1)
        };
        record(node, options, function (err2, val2) {
          val2[val1.key] = val1.val;
          resume([].concat(err1).concat(err2), val2);
        });
      });
    } else if (node.elts && node.elts.length > 0) {
      visit(node.elts[0], options, function (err1, val1) {
        var val = {};
        val[val1.key] = val1.val;
        resume([].concat(err1), val);
      });
    } else {
      resume([], {});
    }
  }
  function exprs(node, options, resume) {
    if (node.elts && node.elts.length > 1) {
      visit(node.elts[0], options, function (err1, val1) {
        node = {
          tag: "EXPRS",
          elts: node.elts.slice(1)
        };
        exprs(node, options, function (err2, val2) {
          var val = [].concat(val2);
          val.unshift(val1);
          resume([].concat(err1).concat(err2), val);
        });
      });
    } else if (node.elts && node.elts.length > 0) {
      visit(node.elts[0], options, function (err1, val1) {
        var val = [val1];
        resume([].concat(err1), val);
      });
    } else {
      resume([], []);
    }
  }
  function program(node, options, resume) {
    if (!options) {
      options = {};
    }
    visit(node.elts[0], options, function (err, val) {
      // Return the value of the last expression.
      resume(err, val.pop());
    });
  }
  function key(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      var key = val1;
      if (false) {
        err1 = err1.concat(error("Argument must be a number.", node.elts[0]));
      }
      visit(node.elts[1], options, function (err2, val2) {
        var obj = val2;
        if (false) {
          err2 = err2.concat(error("Argument must be a number.", node.elts[1]));
        }
        resume([].concat(err1).concat(err2), Object.keys(obj)[key]);
      });
    });
  }
  function val(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      var key = val1;
      if (false) {
        err1 = err1.concat(error("Argument must be a number.", node.elts[0]));
      }
      visit(node.elts[1], options, function (err2, val2) {
        var obj = val2;
        if (false) {
          err2 = err2.concat(error("Argument must be a number.", node.elts[1]));
        }
        resume([].concat(err1).concat(err2), obj[key]);
      });
    });
  }
  function len(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      var obj = val1;
      if (false) {
        err1 = err1.concat(error("Argument must be a number.", node.elts[0]));
      }
      resume([].concat(err1), obj.length);
    });
  }
  function add(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      val1 = +val1;
      if (isNaN(val1)) {
        err1 = err1.concat(error("Argument must be a number.", node.elts[0]));
      }
      visit(node.elts[1], options, function (err2, val2) {
        val2 = +val2;
        if (isNaN(val2)) {
          err2 = err2.concat(error("Argument must be a number.", node.elts[1]));
        }
        resume([].concat(err1).concat(err2), val1 + val2);
      });
    });
  }
  function mul(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      val1 = +val1;
      if (isNaN(val1)) {
        err1 = err1.concat(error("Argument must be a number.", node.elts[0]));
      }
      visit(node.elts[1], options, function (err2, val2) {
        val2 = +val2;
        if (isNaN(val2)) {
          err2 = err2.concat(error("Argument must be a number.", node.elts[1]));
        }
        resume([].concat(err1).concat(err2), val1 * val2);
      });
    });
  }
  function style(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      visit(node.elts[1], options, function (err2, val2) {
        resume([].concat(err1).concat(err2), {
          value: val1,
          style: val2
        });
      });
    });
  }
  function styleV1(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      visit(node.elts[1], options, function (err2, val2) {
        resume([].concat(err1).concat(err2), {
          style: val1,
          value: val2
        });
      });
    });
  }
  return transform;
}();
var render = function () {
  function escapeXML(str) {
    return String(str).replace(/&(?!\w+;)/g, "&amp;").replace(/\n/g, " ").replace(/\\/g, "\\\\").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function render(val, options, resume) {
    // Do some rendering here.
    resume([], val);
  }
  return render;
}();
var compiler = exports.compiler = function () {
  exports.version = "v1.0.0";
  exports.compile = function compile(code, data, resume) {
    // Compiler takes an AST in the form of a node pool and transforms it into
    // an object to be rendered on the client by the viewer for this language.
    try {
      (function () {
        var options = {
          data: data
        };
        transform(code, options, function (err, val) {
          if (err.length) {
            resume(err, val);
          } else {
            render(val, options, function (err, val) {
              resume(err, val);
            });
          }
        });
      })();
    } catch (x) {
      console.log("ERROR with code");
      console.log(x.stack);
      resume(["Compiler error"], {
        score: 0
      });
    }
  };
}();