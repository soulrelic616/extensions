/*jslint node: true */

(function () {
    'use strict';

    var /* Globals */
        config,
        done,
        fail,

        /* Defaults */
        defaults = {
            compress : true,
            basedir: '/'
        },

        /* Requires */
        fs = require('fs'),
        path = require('path'),
        type = require('type-of-is'),
        merge = require('merge');

    /**
     * Parse and process the less file.
     */
    function less() {
        var parser, css;

        if (!type.is(config.source, String)) {
            return fail.call(null, "Wrong source type!");
        }

        config.source = path.normalize(path.join(config.root, config.basedir, config.source));

        fs.readFile(config.source, 'utf-8', function (err, data) {
            if (err) {
                console.log("LESS file error");
                
                return fail.call(null, err);
            }

            parser = new (require('less').Parser)({
                paths: [
                    path.dirname(config.source)
                ],
                filename: path.basename(config.source)
            });

            parser.parse(data, function (err, tree) {
                if (err) {
                    return fail.call(null, err);
                }

                try {
                    css = tree.toCSS({
                        compress: config.compress,
                        yuicompress: config.compress
                    });
                } catch (ex) {
                    fail.call(null, ex);
                }

                fs.writeFile(path.normalize(path.join(config.root, config.basedir, config.dest)), css, function (err) {
                    if (err) {
                        return fail.call(null, err);
                    }

                    done.call();
                });
            });
        });
    }

    /**
     * This method is used by ficompiler when it finds a matching type in the config.
     * 
     * @param cfg The config for this type read from the ficompiler.json file
     * @param wee The done callback
     * @param boo The fail callback
     */
    exports.start = function start(cfg, wee, boo) {
        /* Merge the defaults for this type with the provided config */
        config = merge(true, defaults, cfg);

        /* Assign the callbacks to the globals */
        done = wee;
        fail = boo;

        /* Start with less */
        less();
    };

}());
