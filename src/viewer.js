/* Copyright (c) 2016, Art Compiler LLC */
/* @flow */
import {assert, message, messages, reserveCodeRange} from "./assert";
import * as React from "react";
import * as d3 from "d3";

window.gcexports.viewer = (function () {
  function capture(el) {
    return null;
  }
  // Return a new array by collecting the results of the specified function
  // for each element in the current selection, passing in the current datum d
  // and index i, with the this context of the current DOM element.
  d3.selection.prototype.map_flat = function(f) {
    var arr = [];
    this.each(function(d, i) {
      arr[arr.length] = f.call(this, d, i);
    });
    return arr;
  };
  
  // Return a new nested array by collecting the results of the specified function
  // for each element in the current selection, passing in the current datum d
  // and indexes i and j with the this context of the current DOM element.
  d3.selection.prototype.map_nested = function(f) {
    var arr = d3.range(this.length).map(function() { return []; });
    this.each(function(d, i, j) {
      arr[j].push(f.call(this, d, i, j));
    });
    return arr;
  };

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
      var obj = props.obj ? [].concat(props.obj) : [];
      var elts = [];
      obj.forEach(function (d, i) {
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
          } else if (typeof val !== "string" &&
                     typeof val !== "number" &&
                     typeof val !== "boolean") {
            val = JSON.stringify(val);
          }
          elts.push(<span key={i} style={style}>{val}</span>);
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

