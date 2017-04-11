define(function(require, exports, module){

////////////////////////////////////////////////////////////////////////////////

var extUtils = brackets.getModule('utils/ExtensionUtils');
extUtils.loadStyleSheet(module, 'main.css');

var registry = {};
var current;

////////////////////////////////////////////////////////////////////////////////

brackets.getModule('utils/AppInit').appReady(function(){
    var editor = brackets.getModule('editor/EditorManager');

    $(editor).on('activeEditorChange', onActiveEditorChange);
    $(brackets.getModule('document/DocumentManager')).on('documentSaved', onDocumentSaved);

    onActiveEditorChange(null, editor.getActiveEditor());
});

////////////////////////////////////////////////////////////////////////////////

var config = require('./config');

function onActiveEditorChange(event, editor){
    var file, lang;
    var gutters;

    if (!editor || !editor.document)
        return;

    file = editor.document.file.fullPath;
    lang = editor.document.getLanguage().getId();

    current = registry[file] = registry[file] || {
        cm: null,
        data: null,
        widget: {},
        scope: {},
        config: config[lang]
    };
    current.cm = editor._codeMirror;

    gutters = current.cm.getOption('gutters').slice(0);

    if (gutters.indexOf('lintyai-gutter') == -1){
        gutters.push('lintyai-gutter');
        current.cm.setOption('gutters', gutters);

        current.cm.on('gutterClick', onGutterClick);
    }

    onDocumentSaved(null, editor.document);
}

////////////////////////////////////////////////////////////////////////////////

function onDocumentSaved(event, document){
    if (document.file.isDirty || !current.config)
        return;

    if (!event && current.data !== null)
        return updateGutter();

    commander(current.config.cmd + ' "' + document.file.fullPath + '"');
}

////////////////////////////////////////////////////////////////////////////////

function onGutterClick(cm, line){
    var widget, scope;

    widget = current.widget[line];
    scope = current.scope[line];

    if (!widget)
        return;

    if (scope.length){
        while (scope.length)
            scope.pop().clear();

        return;
    }

    for (var i in widget)
        scope.push(current.cm.addLineWidget(line, widget[i], {coverGutter: true}));
}

////////////////////////////////////////////////////////////////////////////////

function updateGutter(){
    var lint;
    var gutter, widget;

    current.cm.clearGutter('lintyai-gutter');

    for (var i in current.scope){
        while (current.scope[i].length)
            current.scope[i].pop().clear();
    }

    current.widget = {};
    current.scope = {};

    if (!current.data || !(lint = current.config.re(current.data)))
        return;

    lint = (lint.line ? [lint] : lint);

    gutter = $('<div class="lintyai-gutter" />');
    widget = $('<div class="lintyai-line-widget" />');

    for (var i in lint){
        var type;
        var line;

        if (current.config.type)
            for (type in current.config.type){
                if (current.config.type[type].test(lint[i].message))
                    break;

                type = null;
            }

        line = (lint[i].line - 1);

        current.widget[line] = current.widget[line] || [];
        current.scope[line] = [];

        !current.widget[line].length &&
        current.cm.setGutterMarker(
            line, 'lintyai-gutter',
            gutter.clone().addClass(type || 'error').text(lint[i].line)[0]
        );

        current.widget[line].push(
            widget.clone().addClass(type || 'error').text(lint[i].message.trim())[0]
        );
    }
}

////////////////////////////////////////////////////////////////////////////////

var Node = brackets.getModule('utils/NodeDomain');
var lintyai = new Node('lintyai', extUtils.getModulePath(module, 'node/commander'));

function commander(cmd){
    var dir;

    dir = extUtils.getModulePath(module, 'node/node_modules/');
    cmd = cmd.replace('%s', dir); 

    lintyai.exec('commander', cmd).done(function(data){
        current.data = data;
        updateGutter();
    });
}

////////////////////////////////////////////////////////////////////////////////

});
