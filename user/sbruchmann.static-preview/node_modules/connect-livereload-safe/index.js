'use strict';

var rewrite = require('connect-body-rewrite');

module.exports = function (options) {
    if (!options) {
        options = {};
    }
    var host = options.host || "http://localhost:35729";
    var script = "<script src=\"" + host + "/livereload.js?snipver=1\"></script>\n";

    return rewrite({
        accept: function (res) {
            return (res.getHeader('content-type') || '').match(/text\/html/);
        },
        rewrite: function (body) {
            return body.replace(/(<\/body>)/, script + "$1");
        }
    });
};
