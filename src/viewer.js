/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/* Copyright (c) 2015, Art Compiler LLC */
import {assert, message, messages, reserveCodeRange} from "./assert";
import * as React from "./react";
window.exports.viewer = (function () {
  function capture(el) {
    var mySVG = $(el).html();
    return mySVG;
  }
  var Timer = React.createClass({
    tick: function() {
      let secondsElapsed = this.props.secondsElapsed;
      let state = {
        secondsElapsed: (secondsElapsed ? secondsElapsed : 0) + 5
      };
      window.dispatcher.dispatch({
        data: state,
      });
    },
    componentDidMount: function() {
      this.interval = setInterval(this.tick, 5000);
    },
    componentWillUnmount: function() {
      clearInterval(this.interval);
    },
    render: function() {
      return (
          <div>{this.props.secondsElapsed}</div>
      );
    }
  });
  var Viewer = React.createClass({
    render: function () {
      // If you have nested components, make sure you send the props down to the
      // owned components.
      var props = this.props;
      var data = props.data ? props.data : [];
      var elts = [];
      data.forEach(function (d, i) {
        var style = {};
        if (d.style) {
          d.style.forEach(function (p) {
            style[p.key[0]] = p.val.value;
          });
        }
        if (d.value === "$$timer$$") {
          elts.push(<span key={i} style={style}><Timer {...props}/></span>);
        } else {
          elts.push(<span key={i} style={style}>{""+d.value}</span>);
        }
      });
      return (
        elts.length > 0 ? <div>{elts}</div> : <div/>
      );
    },
  });
  return {
    capture: capture,
    Viewer: Viewer
  };
})();

