# LiveLocalhost

A simple localhost development server with hot reloading. Serves any local directory, watches for file changes, and triggers live browser reloading.


## Command line usage

To use LiveLocalhost from the command line, install it globally:

```bash
npm install livelocalhost -g
```

To serve static files from the current directory on HTTP port 8000:

```bash
llh
```

or

```bash
livelocalhost
```

and access http://localhost:8000/ in your browser.


### Options

Options can be defined with a single dash (`-`), double dash (`--`), in `-name=value`, or `-name value` format.

|parameter|description|
|-|-|
|`--port`, `--serveport <port>`| HTTP port (default `8000`) |
|`--dir`,  `--servedir <dir>`  | directory to serve (default `./`) |
|`--reloadservice <path>`      | path to reload service (default `/livelocalhost.service`) |
|`--hotloadJS`                 | enable hot reloading of JavaScript files (default `false`) |
|`--watchDebounce <ms>`        | debounce time for file changes (default `600`) |
|`--v`, `--version`            | show version information |
|`--?`, `--help`               | show help |


The `reloadservice` need only be changed if you want to disable or change the Server Sent Events handler path. By default, the path is `/livelocalhost.service`. A client-side script at `/livelocalhost.service.js` is injected into HTML files to trigger reloading.

Hot reloading of client-side JavaScript is disabled unless you enable `--hotloadJS`. This refreshes the whole page when any JavaScript file changes.

`--watchDebounce` sets a delay time to ensures multiple file changes do not trigger more than one live reload.

Examples:

```bash
llh -port 8080 --dir=./build/ -reloadservice /reload
llh --port=8080 -dir ./build/ --reloadservice=/reload
```

The first two non-dashed parameters are presumed to be the port and directory:

```bash
llh 8080 ./build/ --reloadservice=0
```

Stop the server with `Ctrl` | `Cmd` + `C`.


## Node.js module usage

Install `livelocalhost` in your Node.js project:

```bash
npm install livelocalhost
```

Optionally add `--save-dev` to ensure it's only loaded in development mode.

Import the module:

```js
import { livelocalhost } from 'livelocalhost';
```

set [options](#options) as necessary, e.g.

```js
livelocalhost.serveport = 8080;
livelocalhost.servedir = './build/';
livelocalhost.reloadservice = '/reload';
livelocalhost.hotloadJS = true;
livelocalhost.watchDebounce = 2000;
```

and start the server:

```js
livelocalhost.start();
```


## Changes

### 1.0.2

* all CSS files are hot reloaded if one changes to ensure `@import` works.
* fixed bug that reloaded all `<link>` elements such as sitemaps, feeds, and favicons.

### 1.0.1

* `package.json` fix.
