/* Copyright (c) 2016, Art Compiler LLC */
/* @flow */
import {assert, message, messages, reserveCodeRange} from "./assert";
import * as React from "react";

window.gcexports.viewer = (function () {
  function capture(el) {
    return null;
  }
  var Timer = React.createClass({
    interval: 0,
    tick: function() {
      let secondsElapsed = this.props.secondsElapsed;
      let state = {
        secondsElapsed: (secondsElapsed ? secondsElapsed : 0) + 5
      };
      // To save state, dispatch it as a property named 'data'. This will save
      // the state to the server, update the URL and the props used to render
      // the view.
      window.dispatcher.dispatch({
        updateHistory: true,
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
        <div>{this.props.secondsElapsed?this.props.secondsElapsed:0}</div>
      );
    }
  });

  // Graffiticode looks for this React class named Viewer. The compiled code is
  // passed via props in the renderer.
  var Viewer = React.createClass({
    componentDidMount: function() {
    },
    render: function () {
      // If you have nested components, make sure you send the props down to the
      // owned components.
      var props = this.props;
      var data = props.data ? props.data : [];
      var elts = [];
      data.forEach(function (d, i) {
        var style = {};
        if (d.style) {
          Object.keys(d.style).forEach(function (k) {
            style[k] = d.style[k];
          });
        }
        if (d.value === "$$timer$$") {
          elts.push(<span key={i} style={style}><Timer {...props}/></span>);
        } else {
          let val = d.value ? d.value : d;
          if (val instanceof Array) {
            val = val.join(" ");
          }
          elts.push(<span key={i} style={style}>{"" + val}</span>);
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

