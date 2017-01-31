/*global $, require, brackets, define, console */


define(function (require, exports, module) {
    'use strict';

    var ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        NodeDomain = brackets.getModule("utils/NodeDomain"),
        ProjectManager = brackets.getModule('project/ProjectManager'),
        Panel = brackets.getModule('view/PanelManager').createBottomPanel('ficompiler', $(require('text!panel.html'))),
        ficompiler = new NodeDomain('ficompiler', ExtensionUtils.getModulePath(module, 'node/ficompiler'));

    /******* Utility Functions ******/
    function getType(obj) {
        return Object.prototype.toString.call(obj);
    }

    function isString(obj) {
        return getType(obj) === '[object String]';
    }

    function isArray(obj) {
        return getType(obj) === '[object Array]';
    }

    function isObject(obj) {
        return getType(obj) === '[object Object]';
    }

    /**
     * log function
     * 
     * Display a bottom panel with information about the last ficompiler error
     * 
     * @return void
     */
    function log(message) {
        var content,
            arg;

        arguments[0].forEach(function(arg) {
            if (arg) {
                if (isObject(arg) || isArray(arg)) {
                    arg = JSON.stringify(arg, null, 4);
                } else if (isString(arg)) {
                    arg = String(arg);
                }

                content = document.createElement('pre');
                content.appendChild(document.createTextNode(arg));

                $('#ficompiler-errors').append(content);
            }
        });

        Panel.show();
    }

    $('#ficompiler-panel').find('.close').on('click', function () {
        Panel.hide();
    });

    $(brackets.getModule('document/DocumentManager')).on('documentSaved', function start(event, document) {
        if (document.file.isDirty) {
            return;
        }

        var docpath = ProjectManager.getProjectRoot().fullPath;

        Panel.hide();

        $('#ficompiler-errors').empty();

        ficompiler.exec('start', docpath).fail(function () {
            log.apply(this, arguments);
        });
    });
});