/*jslint node: true */
/*global $*/

(function () {
    'use strict';

    var /* Globals */
        types = [],
        ctype = 0,
        root,
        exfail,

        /* Requires */
        fs = require('fs'),
        path = require('path'),
        type = require('type-of-is'),
        merge = require('merge');

    /* Process the next type or finish */
    function done() {
        types[ctype].curr += 1;

        if (Number(types[ctype].curr) === Number(types[ctype].source.length)) {
            types[ctype].curr = 0;

            ctype += 1;
        }

        if (Number(ctype) === Number(types.length)) {
            ctype = 0;
            root = null;
        } else {
            next();
        }
    }

    function fail() {
        console.error.apply(console, ['ficompiler failed!', types[ctype].name + ' failed!'].concat(arguments));

        exfail.call(exfail, [types[ctype].name + ' failed!'].concat(arguments));
    }

    /* Process the next source in type */
    function next() {
        try {
            require('./types/' + types[ctype].name).start(merge(true, types[ctype], {
                source : types[ctype].source[types[ctype].curr],
                dest : types[ctype].dest[types[ctype].curr]
            }), done, fail);
        } catch (ex) {
            return fail.call(null, ex);
        }
    }

    /* Config is ready */
    function ready(config) {
        var type;

        types = [];

        for (type in config) {
            if (config.hasOwnProperty(type)) {
                config[type].root = root;
                config[type].name = type;
                config[type].curr = 0;

                types.push(config[type]);
            }
        }

        next();
    }

    /**
     * Reads the ficompiler.json file and starts compiling.
     * 
     * @param docpath The full path from the brackets document manger.
     * @param cb The main fail callback.
     */
    function start(docpath, cb) {
        var ficonf = path.join(docpath, 'ficompiler.json'),
            data;

        /* Assign the globals */
        root = docpath;
        exfail = cb;

        fs.exists(ficonf, function (exists) {
            if (exists) {
                fs.readFile(ficonf, 'utf8', function (err, data) {
                    if (err) {
                        return fail.call(null, err);
                    }

                    try {
                        data = JSON.parse(data);
                    } catch (ex) {
                        return fail.call(null, ex);
                    }

                    if (type.is(data, Object)) {
                        ready(data);
                    } else {
                        return fail.call(null, "Malformed configuration file");
                    }
                });
            }
        });
    }

    exports.init = function (domainManager) {
        if (!domainManager.hasDomain('ficompiler')) {
            domainManager.registerDomain('ficompiler', {
                major: 0,
                minor: 1
            });
        }

        domainManager.registerCommand('ficompiler', 'start', start, true, 'Compiles the types in your ficompiler.json', [{
            name: 'config',
            type: 'object',
            description: 'Your ficompiler configuration'
        }], [{
            name: 'void',
            type: 'void',
            description: 'returns void'
        }]);
    };

}());
