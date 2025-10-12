# LiveLocalhost

[**GitHub**](https://github.com/craigbuckler/livelocalhost) | [**npm**](https://www.npmjs.com/package/livelocalhost) | [**sponsor**](https://github.com/sponsors/craigbuckler) | [craigbuckler.com](https://craigbuckler.com/) | [BlueSky](https://bsky.app/profile/craigbuckler.com) | [X](https://x.com/craigbuckler)

A simple localhost development web server with hot reloading. It serves web files from any local directory, watches for file changes, and triggers automated browser refreshes. You can run it from the command line or within a Node.js application.


## Quick start

Run LiveLocalhost from the command line to serve files from the current directory:

```bash
npx livelocalhost
```

then open [localhost:8000](http://localhost:8000/) in your browser.

You can also install it globally:

```bash
npm install livelocalhost -g
```

and run using:

```bash
livelocalhost
```

or

```bash
llh
```

To use a different port and directory:

```bash
llh -p 8888 -d ./path/
```


## Command line configuration

Add `-?` or `--help` for CLI help. Options:

|parameter|description|
|-|-|
| `-v`, `--version` | show application version |
| `-?`, `--help` | show CLI help |
| `-E`, `--helpenv` | show .env/environment variable help |
| `-A`, `--helpapi` | show Node.js API help |
| `-e`, `--env <file>` |load defaults from an .env file|
| `-p`, `--serveport <port>` | HTTP port (default `8000`) |
| `-d`, `--servedir <dir>` | directory to serve (`./`) |
| `-r`, `--reloadservice <path>` | path to [reload service](#hot-reloading) (`/livelocalhost.service`) |
| `-j`, `--hotloadJS` | enable hot reloading of JavaScript files (`false`) |
| `-w`, `--watchDebounce <ms>` | [debounce time](#watch-debouncing) for file changes (default `600`) |
| `-l`, `--accessLog` | show server access log (`false`) |

Serve files from `./build/` at `http://localhost:8080` and show the access log:

```bash
llh --serveport 8080 -d ./build/ -l
```

The first two non-dashed parameters set the port and directory:

```bash
llh 8080 ./build/ -l
```

Stop the server with `Ctrl` | `Cmd` + `C`.


## Environment variable configuration

You can configure the server with environment variables. Add `-E` or `--helpenv` for help. Variables:

|env variable|description|
|-|-|
| `SERVE_PORT=<port>` | HTTP port (default `8000`) |
| `BUILD_DIR=<dir>` | directory to serve (`./`) |
| `RELOAD_SERVICE=<path>` | path to [reload service](#hot-reloading) (`/livelocalhost.service`) |
| `HOTLOAD_JS=<true\|false>` | enable hot reloading of JavaScript files (`false`) |
| `WATCH_DEBOUNCE=<num>` | [debounce time](#watch-debouncing) for file changes (default `600`) |
| `ACCESS_LOG=<true\|false>` | show server access log (`false`) |

You can define variables in a file, e.g.

```ini
# example .env file
SERVE_PORT=8080
BUILD_DIR=./build/
ACCESS_LOG=true
```

then loaded:

```bash
llh --env .env
```

Note that CLI arguments take precedence over environment variables.


## Node.js API usage

You can use LiveLocalhost in any Node.js project. Add `-A`  or `--helpapi` for help.

Install in your project:

```bash
npm install livelocalhost --save-dev
```

*(`--save-dev` ensures it's available in development but not production)*

Import the module into any JavaScript file (such as `index.js`):

```js
import { livelocalhost } from 'livelocalhost';
```

set options as necessary, e.g.

```js
livelocalhost.serveport     = 8080;       // HTTP port
livelocalhost.servedir      = './build/'; // directory to serve
livelocalhost.reloadservice = '/reload';  // path to reload service
livelocalhost.hotloadJS     = true;       // hot reload JS
livelocalhost.watchDebounce = 2000;       // debounce time
livelocalhost.accessLog     = true;       // show server logs
```

(*When not set, options fall back to environment variables then defaults.*)

Execute the `.start()` method to start the server:

```js
livelocalhost.start();
```

Launch your application as normal (`node index.js`) and open the server URL in your browser.


## Hot reloading

Browser hot reloading is available when:

  1. the application has permission to watch OS files, and
  2. `--reloadservice` is a valid URL path starting `/`.

The default Server Sent Events service path for hot reloading is `/livelocalhost.service`. The server injects a client-side script at `/livelocalhost.service.js` into all HTML files which automatically refreshes the browser:

* CSS changes are hot reloaded without a full page refresh
* HTML changes trigger a full page refresh
* JavaScript changes trigger a full page refresh when you enable `--hotloadJS` (off by default).

You can change `--reloadservice` when its path is in use by another asset. Disable hot reloading by setting any value that does not start with `/`.


## Watch debouncing

When a file changes, LiveLocalhost waits 600ms. A hot reload triggers if no other files change within that time.

You can change the delay time using `--watchDebounce`. Note that low settings can make reloading slower.
