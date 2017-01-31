// Generated by CoffeeScript 1.3.3
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require, exports, module) {
    'use strict';

    var ColorEditor, InlineColorEditor, InlineEditorTemplate, InlineWidget;
    InlineWidget = brackets.getModule("editor/InlineWidget").InlineWidget;
    ColorEditor = require('ColorEditor');
    InlineEditorTemplate = require("text!InlineColorEditorTemplate.html");
    InlineColorEditor = (function(_super) {

      __extends(InlineColorEditor, _super);

      InlineColorEditor.prototype.parentClass = InlineWidget.prototype;

      InlineColorEditor.prototype.$wrapperDiv = null;

      function InlineColorEditor(color, pos) {
        this.color = color;
        this.pos = pos;
        this.setColor = __bind(this.setColor, this);

        this.initialColorString = this.color;
        InlineWidget.call(this);
      }

      InlineColorEditor.prototype.setColor = function(colorLabel) {
        var end;
        if (colorLabel !== this.initialColorString) {
          end = {
            line: this.pos.line,
            ch: this.pos.ch + this.color.length
          };
          this.editor.document.replaceRange(colorLabel, this.pos, end);
          this.editor._codeMirror.setSelection(this.pos, {
            line: this.pos.line,
            ch: this.pos.ch + colorLabel.length
          });
          return this.color = colorLabel;
        }
      };

      InlineColorEditor.prototype.load = function(hostEditor) {
        var self;
        self = this;
        this.editor = hostEditor;
        this.parentClass.load.call(this, hostEditor);
        this.$wrapperDiv = $(InlineEditorTemplate);
        this.colorEditor = new ColorEditor(this.$wrapperDiv, this.color, this.setColor);
        return this.$htmlContent.append(this.$wrapperDiv);
      };

      InlineColorEditor.prototype.close = function() {
        if (this.closed) {
          return;
        }
        this.closed = true;
        this.hostEditor.removeInlineWidget(this);
        if (this.onClose) {
          return this.onClose(this);
        }
      };

      InlineColorEditor.prototype.onAdded = function() {
        return window.setTimeout(this._sizeEditorToContent.bind(this));
      };

      InlineColorEditor.prototype._sizeEditorToContent = function() {
        return this.hostEditor.setInlineWidgetHeight(this, this.$wrapperDiv.outerHeight(), true);
      };

      return InlineColorEditor;

    })(InlineWidget);
    return module.exports = InlineColorEditor;
  });

}).call(this);
