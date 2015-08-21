/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/* Copyright (c) 2015, Jeff Dyer, Art Compiler LLC */
window.exports.viewer = (function () {
  function update(el, obj, src, pool) {
    obj = JSON.parse(obj);
    var str;
    if (obj.error && obj.error.length > 0) {
      str = "ERROR";
    } else {
      data = obj.data;
    }
    var textSpan = "";
    var style = ""
    var height = 24;
    obj.data.forEach(function (data) {
      style = "";
      if (typeof data === "string") {
        str = data[0];
      } else {
        str = data.value;
        if (data.style) {
          data.style.forEach(function (p) {
            style += p.key + ":" + p.val + ";";
            if (p.key === "font-size") {
              height = p.val;
            }
          });
        }
      }
      textSpan += "<tspan style='" + style + "'>" + str + "</tspan> ";
    });
    var text = "<text x='4' y='" + height + "'>" + textSpan + "</text>";
    $(el).html('<g>' + text + '</g>');
    var bbox = $("#graff-view svg g")[0].getBBox();
    $(el).attr("height", (bbox.height + 12) + "px");
    $(el).attr("width", (bbox.width + 10) + "px");
  }
  function capture(el) {
    var mySVG = $(el).html();
    return mySVG;
  }
  return {
    update: update,
    capture: capture,
  };
})();

