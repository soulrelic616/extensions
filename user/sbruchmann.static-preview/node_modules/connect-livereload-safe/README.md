# connect-livereload-safe - middleware to inject livereload, safely.

> Add the livereload script during development.

This is similar to
[connect-livereload](https://github.com/intesso/connect-livereload). Only
difference is that this version does not modify the DOM during loading, which
breaks some scripts (angular-ui-router for instance).

## Usage

Add the module:

```bash
npm install connect-livereload-safe --save-dev
```

Add the middleware:

```javascript
app.use(require('connect-livereload-safe')());
```

You can optionally specify a different host for the livereload server:

```javascript
app.use(require('connect-livereload-safe')({
    host: 'http://localhost:35729'
}));
```

## License 

    (The MIT License)

    Copyright (C) 2013 by Ruben Vermeersch <ruben@savanne.be>

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
