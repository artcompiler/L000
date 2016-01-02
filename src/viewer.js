/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/* Copyright (c) 2015, Jeff Dyer, Art Compiler LLC */
//import {d3} from "./d3.v3.js";
import {assert, message, messages, reserveCodeRange} from "./assert";
import * as React from "./react";
window.exports.viewer = (function () {
  function capture(el) {
    var mySVG = $(el).html();
    return mySVG;
  }
  var Viewer = React.createClass({
    render: function () {
      var data = this.props.data ? this.props.data : [];
      var elts = [];
      data.forEach(function (d, i) {
        var style = {};
        if (d.style) {
          d.style.forEach(function (p) {
            style[p.key[0]] = p.val.value;
          });
        }
        elts.push(<span key={i} style={style}>{d.value}</span>);
      });
      return (
        <div>{elts}</div>
      );
    },
  });
  return {
    capture: capture,
    Viewer: Viewer
  };
})();

