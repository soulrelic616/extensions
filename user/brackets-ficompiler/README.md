brackets-ficompiler
===================

A LESS and JavaScript compiler for Brackets

Installation
------------

Open Brackets and click on the extensions icon. Search for ficompiler and install.

After installing it, go to your brackets extension folder, usually `~/.config/Brackets/extensions/users`, and go to the **node** folder of this extension `[...]/brackets-ficompiler/node` and run `npm install`. If an error occurs, try using **sudo**.

Usage
-----

Usage is pretty simple. Just create a `ficompiler.json` file in the root of your Brackets project and cofigure it as needed.

Example
-------

```js
{
    "javascript": {
        "browserify" : false,
        "compress": false,
        "mangle": false,
        "basedir" : "/",

        "source": [
            [
                "sources/javascripts/main.js",
                "sources/javascripts/module.js"
            ]
        ],

        "dest": [
            "javascripts/main.min.js"
        ]
    },


    "less": {
        "compress": false,
        "basedir" : "/",

        "source": [
            "sources/stylesheets/main.less"
        ],

        "dest": [
            "stylesheets/main.min.css"
        ]
    }
}
```

Expanding
---------

This module can be used for types other than Less and JavaScript. For that, create a module inside the `[...]/brackets-ficompiler/node/types` folder and name it exaclty as the key name in your `ficompiler.json` (Eg.: less, javascript, etc...) and create the logic for that type. If you wish, you could examine the files in the types folder located insude the **node** directory of this extension.
