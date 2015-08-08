/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/* Copyright (c) 2015, Jeff Dyer, Art Compiler LLC */
window.exports.viewer = (function () {
  function update(el, obj, src, pool) {
    var text =
      "<text x='4' y='20'>" +
      "<tspan font-size='14' font-weight='600'>" + obj + "</tspan> " +
      "</text>";
    $(el).html('<g>' + text + '</g>');
    var bbox = $("#graff-view svg g")[0].getBBox();
    $(el).attr("height", (bbox.height + 20) + "px");
    $(el).attr("width", (bbox.width + 40) + "px");
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

