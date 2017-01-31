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
            mangle : true,
            basedir: '/'
        },

        /* Requires */
        fs = require('fs'),
        path = require('path'),
        type = require('type-of-is'),
        merge = require('merge');

    /**
     * Write the data to the destination file
     */
    function write(data) {
        if (data) {
            fs.writeFile(path.normalize(path.join(config.root, config.basedir, config.dest)), data, function (err) {
                if (err) {
                    return fail.call(null, err);
                }

                done.call();
            });
        } else {
            return fail.call(null, "No data to save!");
        }
    }

    /**
     * Uglify the data
     */
    function uglify(source) {
        try {
            var code = require('uglify-js').minify(source, {
                fromString: config.browserify,
                mangle : config.mangle,
                compress : config.compress,
                output : config.compress ? null : {
                    comments : true,
                    indent_level : 4,
                    beautify : true
                }
            }).code;

            write(code);
        } catch (ex) {
            return fail.call(null, ex);
        }
    }

    /**
     * Browserify the source files
     */
    function browserify() {
        console.log('browserify');

        (require('browserify'))(config.source, {
            debug: !config.compress && !config.mangle
        }).bundle(function (err, buf) {
            if (err) {
                return fail.call(null, err);
            }

            uglify(buf.toString());
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
        var i;
        
        /* Merge the defaults for this type with the provided config */
        config = merge(true, defaults, cfg);
        
        /* Assign the callbacks to the globals */
        done = wee;
        fail = boo;

        /* Normalize the source */
        if (type.is(config.source, Array)) {
            for (i = 0; i < config.source.length; i += 1) {
                config.source[i] = path.normalize(path.join(config.root, config.basedir, config.source[i]));
            }
        } else {
            config.source = [
                path.normalize(path.join(config.root, config.basedir, config.source))
            ];
        }

        if (config.browserify) {
            /* Start with browserify */
            browserify();
        } else {
            /* Start with unglify */
            uglify(config.source);
        }
    };

}());
