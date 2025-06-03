# LiveLocalhost

A simple localhost development server with hot reloading. Serves any local directory, watches for file changes, and triggers live browser reloading.


## Command line usage

Run LiveLocalhost from the command line:

```bash
npx livelocalhost
```

You can also install it globally:

```bash
npm install livelocalhost -g
```

and serve static files using:

```bash
llh
```

or

```bash
livelocalhost
```

Once started, you can access http://localhost:8000/ in your browser.


### Options

Options can can be set with `--name=value`, or `--name value` format.

|parameter|description|
|-|-|
| `-e`, `--env <file>` |load defaults from an .env file|
| `-p`, `--serveport <port>` | HTTP port (default `8000`) |
| `-d`, `--servedir <dir>` | directory to serve (`./`) |
| `-r`, `--reloadservice <path>` | path to reload service (`/livelocalhost.service`) |
| `-j`, `--hotloadJS` | enable hot reloading of JavaScript files (`false`) |
| `-w`, `--watchDebounce <ms>` | debounce time for file changes (default `600`) |
| `-l`, `--accessLog` | show server access log (`false`) |
| `-v`, `--version` | show application version |
| `-?`, `--help` | show CLI help |
| `-E`, `--helpenv` | show .env/environment variable help |
| `-A`, `--helpapi` | show Node.js API help |

The `reloadservice` need only be changed if you want to disable or change the Server Sent Events handler path. By default, the path is `/livelocalhost.service`. A client-side script at `/livelocalhost.service.js` is injected into HTML files to trigger reloading.

Hot reloading of client-side JavaScript is disabled unless you enable `--hotloadJS`. This refreshes the whole page when any JavaScript file changes.

`--watchDebounce` sets a delay time to ensures multiple file changes do not trigger more than one live reload.

Examples:

```bash
llh --serveport 8080 --servedir=./build/ --reloadservice /reload
```

The first two non-dashed parameters are presumed to be the port and directory:

```bash
llh 8080 ./build/
```

You can also use environment variables to configure options - enter `llh -E` for details.

Stop the server with `Ctrl` | `Cmd` + `C`.


## Node.js module usage

You can use `livelocalhost` in your Node.js projects - enter `llh -A` for details.

Install it into your project:

```bash
npm install livelocalhost
```

Optionally add `--save-dev` to ensure it's only loaded in development mode.

Import the module into a JavaScript file (such as `index.js`):

```js
import { livelocalhost } from 'livelocalhost';
```

set options as necessary, e.g.

```js
livelocalhost.serveport = 8080;
livelocalhost.servedir = './build/';
livelocalhost.reloadservice = '/reload';
livelocalhost.hotloadJS = true;
livelocalhost.watchDebounce = 2000;
livelocalhost.accessLog = true;
```

*(If not explicitly set, the options fall back to environment variables and defaults.)*

Execute the `.start()` method:

```js
livelocalhost.start();
```

Launch your application as normal, e.g. `node index.js`.


## Changes

### 1.1.0, 3 June 2025

* new `accessLog` option
* improved CLI argument parsing, logging, help, and README

### 1.0.3, 14 May 2025

* now works on Windows (path issue fixed)

### 1.0.2, 23 April 2025

* all CSS files are hot reloaded if one changes to ensure `@import` works.
* fixed bug that reloaded all `<link>` elements such as sitemaps, feeds, and favicons.

### 1.0.1, 23 April 2025

* `package.json` fix.
