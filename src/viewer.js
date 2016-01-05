/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/* Copyright (c) 2015, Jeff Dyer, Art Compiler LLC */
import {assert, message, messages, reserveCodeRange} from "./assert";
import * as React from "./react";
window.exports.viewer = (function () {
  function capture(el) {
    var mySVG = $(el).html();
    return mySVG;
  }
  var Timer = React.createClass({
    getInitialState: function() {
      return {secondsElapsed: 0};
    },
    tick: function() {
      let state = {secondsElapsed: this.state.secondsElapsed + 1};
      this.setState(state);
      window.dispatcher.dispatch({
        data: state,
      });
    },
    componentDidUpdate: function() {
    },
    componentDidMount: function() {
      this.interval = setInterval(this.tick, 1000);
      let exports = window.exports;
      let self = this;
      if (exports.data) {
        $.get("http://"+location.host+"/data?id=" + exports.data, function (data) {
          self.setState(data);
        });
      }
    },
    componentWillUnmount: function() {
      clearInterval(this.interval);
    },
    render: function() {
      return (
          <div>{this.state.secondsElapsed}</div>
      );
    }
  });
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
        if (d.value === "$$timer$$") {
          elts.push(<span key={i} style={style}><Timer /></span>);
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

