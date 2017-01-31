// Syntax highlighting for Haml

var LanguageManager = brackets.getModule("language/LanguageManager");

define(function (require, exports, module) {
  "use strict";

  LanguageManager.defineLanguage("haml", {
    name: "Haml",
    mode: ["haml", "text/x-haml"],
    fileExtensions: ["haml", "html.haml", "htm.haml"],
    lineComment: ["-#"]
  });
});
