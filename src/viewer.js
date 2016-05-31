/* Copyright (c) 2015, Art Compiler LLC */
/*
   TODO
   -- Update code based on user intput.
*/
import {assert, message, messages, reserveCodeRange} from "./assert";
import * as React from "react";
//import * as ReactDOM from "react-dom";
import ProseMirror from 'react-prosemirror'

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
      // To save state, dispatch it as a property named 'data'. This will save
      // the state to the server, update the URL and the props used to render
      // the view.
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
          <div>{this.props.secondsElapsed?this.props.secondsElapsed:0}</div>
      );
    }
  });

  const Prose = React.createClass({
    getInitialState() {
      return {
        value: 'Hello World!'
      };
    },
    render() {
      let options = {
        options: {
          docFormat: 'text',
          place: 'graff-view',
        }
      };
      return <ProseMirror value={this.state.value} onChange={this.onChange} {...options} ref="pm" />
    },
    onChange(value) {
      this.setState({value});
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
          d.style.forEach(function (p) {
            style[p.key] = p.val;
          });
        }
        if (d.value === "$$timer$$") {
          elts.push(<span key={i} style={style}><Timer {...props}/></span>);
        } else if (d.value === "$$prose$$") {
          return <Prose id="editor" style={style}/>;
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

