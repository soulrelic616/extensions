/*global define, brackets, window*/
define(function (require, exports, module) {
  "use strict";
  var AppInit = brackets.getModule("utils/AppInit"),
    ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
    viewTab;
  AppInit.htmlReady(function () {
    ExtensionUtils.loadStyleSheet(module, "./simple.min.css");
    ExtensionUtils.loadStyleSheet(module, "./icons.min.css");
    viewTab = require("./viewTab.min");
    require("./icons.min");
    require("./grayScale.min");
    require("./scrollwheel.min");
    require("./opacity.min");
    require("./workingFiles.min");
    require("./toolbar.min");
    require("./showButtons.min");
    viewTab.html(require('text!./tabbar.html'));
  });
  AppInit.extensionsLoaded(function () {
    //require("./hassle");
    viewTab.extension(require('text!./tooltip.html'));
  });
  AppInit.appReady(function () {
    viewTab.ready();
    var _ftrs = window.setTimeout(function () {
      require("./prefs.min")(require('text!./preferences.html'), 514);
      window.clearTimeout(_ftrs);
    }, 1000);
    require("./hassle.min");
  });
});