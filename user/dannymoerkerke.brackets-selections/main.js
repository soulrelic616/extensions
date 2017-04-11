/*
 * Copyright (c) 2015 Danny Moerkerke <danny@dannymoerkerke.nl>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */


/*global define, brackets, $ */

define(function (require, exports, module) {
    "use strict";

    // Brackets modules
    var CommandManager      = brackets.getModule("command/CommandManager"),
        EditorManager       = brackets.getModule("editor/EditorManager"),
        KeyBindingManager   = brackets.getModule("command/KeyBindingManager"),
        Menus               = brackets.getModule("command/Menus"),
        StringUtils         = brackets.getModule("utils/StringUtils");


    // Constants
    var EDIT_SELECTIONS         = "Expand selection to brackets",
        EDIT_SELECT_INDENT      = "Expand selection to indentation",
        EDIT_SELECT_TO_START    = "Select to start of document",
        EDIT_SELECT_TO_END      = "Select to end of document",
        CMD_SELECTBRACKETS      = "dannymoerkerke.bracketsSelectBrackets",
        CMD_SELECT_INDENT       = "dannymoerkerke.bracketsSelectIndent",
        CMD_SELECT_TO_START     = "dannymoerkerke.bracketsSelectToStart",
        CMD_SELECT_TO_END       = "dannymoerkerke.bracketsSelectToEnd",
        SEARCH_CONFIG           = { maxScanLineLength: 50000, maxScanLines: 1000 };

    // currently active editor
    var editor;
    
    /**
     * Get active editor after changes in document / focus
     */
    EditorManager.on('activeEditorChange', function(e, newEditor) {
        editor = newEditor; 
    });
    
    /**
     * Returns currently active editor
     * 
     * @returns Editor  editor
     */
    function getEditor() {
        if(!editor) editor = EditorManager.getActiveEditor();
        return editor;
    }
    
    /**
     * Returns position object for range to be selected between brackets, parens, quotes etc.
     * 
     * @param   Object     pos    cursor position to start reference from
     * @returns Object     range to be selected
     */
    function getRangeForBrackets(pos) {
        var editor = getEditor();
        
        // get current cursor position, if there is a selection get the start of the selection
        var curPos = editor.hasSelection() ? editor.getSelection().start : editor.getCursorPos();
        var range = editor._codeMirror.findMatchingBracket(pos, false, SEARCH_CONFIG);
        
        // cursor was on a brace so range is the range between the matching brackets that needs to be selected
        if (range) {
            
            // there is already a selection, probably from the preceding pair of brackets
            if(editor.hasSelection()) {
                var sel = editor.getSelection();
                
                // if the selection is equal to or larger than the found range between the matching brackets
                // then expand it by one character on both ends and scan again to find any brackets surrounding
                // the current selection
                if(sel.start.line === range.from.line && sel.end.line === range.to.line && 
                   (sel.start.ch <= range.from.ch && sel.end.ch >= range.to.ch)) {
                    sel.start.ch--;
                    editor.setSelection(sel.start, sel.start);
                    curPos = editor.getCursorPos();
                    range = editor._codeMirror.findMatchingBracket(curPos, false, SEARCH_CONFIG);

                    if(!range) return;
                    range.to.ch++;
                }
            }
            return range;
        } 
        else {
            // cursor wasn't on a brace, so just find the first one going backwards from the current pos
            var prevBrace = editor._codeMirror.scanForBracket(editor.getCursorPos(), -1, undefined, SEARCH_CONFIG);
            if (prevBrace) {
                range = editor._codeMirror.findMatchingBracket(prevBrace.pos, false, SEARCH_CONFIG);
                if(!editor.hasSelection()) range.from.ch = range.from.ch+1;

                return range;
            }
        }
    }
    
    /**
     * Handle selection of indentation
     */
    function handleSelectIndent() {
        var editor = getEditor(),
            doc = editor.document;
        
        // get the line of the current cursor position or, if there is any selection, start searching for
        // indentation starting from one line before the selection
        var curLine = editor.hasSelection() ? editor.getSelection().start.line-1 : editor.getCursorPos().line,
            lines = StringUtils.getLines(doc.getText()),
            numLines = lines.length;

        // get the indentation (if any) of the current line
        var line = doc.getLine(curLine),
            match = line.match(/^(\s*)(^\s*)/g);

        if(match.length) {
            var indentation = match[0],
                lineNum = curLine,
                startLineNum = lineNum,
                first = {},
                last = {},
                curMatch;
            
            // scan the preceding lines for indentation
            while(lineNum > 0) {
                lineNum--;
                curLine = doc.getLine(lineNum);
                curMatch = curLine.match(/^(\s*)(^\s*)/g);
                
                // found a non-empty line with smaller indentation than the starting line
                // this is the first line before the current indentation level
                // one line further is the first line of the current indentation level
                if(curLine.length > 0 && curMatch.length && curMatch[0].length < indentation.length) {
                    first.line  = lineNum + 1;
                    first.ch = 0;
                    break;
                }
            }

            lineNum = startLineNum;
            
            // scan the following lines for indentation
            while(lineNum < numLines) {
                lineNum++;
                curLine = doc.getLine(lineNum);
                curMatch = curLine.match(/^(\s*)(^\s*)/g);
                
                // found a non-empty line with smaller indentation than the starting line
                // this is the last line of the current indentation level
                // one line back is the last line of the current indentation level
                if(curLine.length > 0 && curMatch.length && curMatch[0].length < indentation.length) {
                    last.line  = lineNum - 1;
                    last.ch = doc.getLine(last.line).length;
                    break;
                }
            }
            editor.setSelection(first, last);
        }
    }
    
    /**
     * Handle selection from current cursor position to start of document
     */
    function handleSelectToStart() {
        var editor = getEditor(),
            curPos = editor.getCursorPos();

        editor.setSelection({line: 0, ch: 0}, curPos);
    }
    
    /**
     * Handle selection from current cursor position to end of document
     */
    function handleSelectToEnd() {
        var editor = getEditor(),
            doc = editor.document,
            curPos = editor.getCursorPos(),
            lines = StringUtils.getLines(doc.getText()),
            end = {};
        
        end.line = lines.length - 1;
        end.ch = doc.getLine(end.line).length - 1;
        editor.setSelection(curPos, end);
    }
    
    /**
     * Handle selection of brackets, parens, quotes etc. from current cursor position 
     */
    function handleSelectBrackets() {
        var editor = getEditor(),
            range,
            curPos = editor.hasSelection() ? editor.getSelection().start : editor.getCursorPos();
        
        // get the range of the current matching brackets
        range = getRangeForBrackets(curPos);
        
        if(range) {
            var from = range.from,
                to = range.to;

            if(editor.hasSelection()) to.ch = to.ch+1;

            editor.setCursorPos(from.line, from.ch);
            editor.setSelection(from, to);
        }
    }

    // Register the commands and shortcuts
    CommandManager.register(
        EDIT_SELECTIONS,
        CMD_SELECTBRACKETS,
        handleSelectBrackets
    );
    CommandManager.register(
        EDIT_SELECT_INDENT,
        CMD_SELECT_INDENT,
        handleSelectIndent
    );
    CommandManager.register(
        EDIT_SELECT_TO_START,
        CMD_SELECT_TO_START,
        handleSelectToStart
    );
    CommandManager.register(
        EDIT_SELECT_TO_END,
        CMD_SELECT_TO_END,
        handleSelectToEnd
    );
    KeyBindingManager.addBinding(CMD_SELECTBRACKETS, "Ctrl-Shift-M", "mac");
    KeyBindingManager.addBinding(CMD_SELECTBRACKETS, "Ctrl-Shift-M", "linux");
    KeyBindingManager.addBinding(CMD_SELECTBRACKETS, "Ctrl-Shift-M", "win");
    
    KeyBindingManager.addBinding(CMD_SELECT_INDENT, "Ctrl-Shift-J", "mac");
    KeyBindingManager.addBinding(CMD_SELECT_INDENT, "Ctrl-Shift-J", "linux");
    KeyBindingManager.addBinding(CMD_SELECT_INDENT, "Ctrl-Shift-J", "win");
    
    KeyBindingManager.addBinding(CMD_SELECT_TO_START, "Cmd-Shift-Up", "mac");
    KeyBindingManager.addBinding(CMD_SELECT_TO_START, "Ctrl-Shift-Up", "linux");
    KeyBindingManager.addBinding(CMD_SELECT_TO_START, "Ctrl-Shift-Up", "win");
    
    KeyBindingManager.addBinding(CMD_SELECT_TO_END, "Cmd-Shift-Down", "mac");
    KeyBindingManager.addBinding(CMD_SELECT_TO_END, "Ctrl-Shift-Down", "linux");
    KeyBindingManager.addBinding(CMD_SELECT_TO_END, "Ctrl-Shift-Down", "win");
    
    // Create a menu item bound to the command
    var menu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
    menu.addMenuItem(CMD_SELECTBRACKETS);
    menu.addMenuItem(CMD_SELECT_INDENT);
    menu.addMenuItem(CMD_SELECT_TO_START);
    menu.addMenuItem(CMD_SELECT_TO_END);
});
