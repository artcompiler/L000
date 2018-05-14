/* Copyright (c) 2017, Art Compiler LLC */
/* @flow */
import {
  assert,
  message,
  messages,
  reserveCodeRange,
  decodeID,
  encodeID,
} from "./share.js";
import * as React from "react";
import * as d3 from "d3";
window.gcexports.viewer = (function () {
  function capture(el) {
    return null;
  }
  var Viewer = React.createClass({
    componentDidMount: function() {
    },
    render: function () {
      // If you have nested components, make sure you send the props down to the
      // owned components.
      var props = this.props;
      var obj = props.obj ? [].concat(props.obj) : [];
      var elts = [];
      obj.forEach(function (d, i) {
        var style = {};
        if (d.style) {
          Object.keys(d.style).forEach(function (k) {
            style[k] = d.style[k];
          });
        }
        let val = d.value ? d.value : d;
        if (val instanceof Array) {
          val = val.join(" ");
        } else if (typeof val !== "string" &&
                   typeof val !== "number" &&
                   typeof val !== "boolean") {
          val = JSON.stringify(val);
        }
        elts.push(<span key={i} style={style}>{val}</span>);
      });
      return (
        elts.length > 0 ? <div>
          <link rel="stylesheet" href="https://l000.artcompiler.com/style.css" />
          {elts}
        </div> : <div/>
      );
    },
  });
  return {
    capture: capture,
    Viewer: Viewer
  };
})();
