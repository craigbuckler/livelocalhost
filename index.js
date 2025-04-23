#!/usr/bin/env node
import process from 'node:process';
import { livelocalhost } from './livelocalhost.js';
import pkg from './package.json' with { type: 'json' };

// parse arguments
const
  arg = [...process.argv].slice(2),
  opt = {
    serveport: null,
    port: null,
    servedir: null,
    dir: null,
    reloadservice: null,
    hotloadJS: null,
    watchDebounce: null,
    version: null,
    v: null,
    help: null,
    '?': null,
  };

let cArg = 'serveport';
arg.forEach((a, i) => {

  if (a.startsWith('-')) {

    a = a.replace(/^-+/, '');
    let key = a, value;

    const p = a.indexOf('=');
    if (p > 0) {
      key = a.slice(0, p);
      value = a.slice(p + 1);
    }

    if ( Object.hasOwn(opt, key) ) {

      if (p > 0) {
        if (value === undefined) value = true;
        opt[key] = value;
        cArg = null;
      }
      else {
        opt[key] = true;
        cArg = key;
      }

    }

  }
  else if (cArg) {

    opt[cArg] = a;
    cArg = (i ? null : 'servedir');

  }

});


// show version
if (opt.version || opt.v) {
  console.log(`${ pkg.version }`);
  process.exit(0);
}


// show help
if (opt.help || opt['?']) {

  console.log(`Starts a development file server in a local directory with live reload support.

Usage:  livelocalhost [options]
        llh [options]

Options:
  --port, --serveport <port>  HTTP port (default 8000)
  --dir,  --servedir <dir>    directory to serve (default ./)
  --reloadservice <path>      path to reload service (default /livelocalhost.service)
  --hotloadJS <true|false>    enable hot reloading of JavaScript files (default false)
  --watchDebounce <ms>        debounce time for file changes (default 600)
  --v, --version              show version information
  --?, --help                 show this help message

All options can use single dash (-), double dash (--), or "name=value" format.
Examples:

  llh -port 8080 --dir=./build/ -reloadservice /reload
  llh --port=8080 -dir ./build/ --reloadservice=/reload

The first two non-dashed parameters are presumed to be the port and directory:

  llh 8080 ./build/

`);

  process.exit(0);
}

// set options
if (opt.port) livelocalhost.serveport = parseFloat( opt.port );
if (opt.serveport) livelocalhost.serveport = parseFloat( opt.serveport );
if (opt.dir) livelocalhost.servedir = opt.dir;
if (opt.servedir) livelocalhost.servedir = opt.servedir;
if (opt.reloadservice !== null) livelocalhost.reloadservice = opt.reloadservice;
if (opt.hotloadJS !== null) livelocalhost.hotloadJS = opt.hotloadJS !== '' && opt.hotloadJS !== '0' && opt.hotloadJS !== 'false';
if (opt.watchDebounce !== null) livelocalhost.watchDebounce = parseFloat( opt.watchDebounce );

// start server
livelocalhost.start();
