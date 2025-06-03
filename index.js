#!/usr/bin/env node
import pkg from './package.json' with { type: 'json' };
import process from 'node:process';
import { parseArgs, styleText } from 'node:util';

import { livelocalhost, concol } from './livelocalhost.js';

const
  // option configuration
  config = [
    { env: null,              cli: 'env',           clis: 'e',  prop: null,             type: 'file',       default: null,                      help: 'load defaults from an .env file' },
    { env: 'SERVE_PORT',      cli: 'serveport',     clis: 'p',  prop: 'serveport',      type: 'num',        default: 8000,                      help: 'HTTP port' },
    { env: 'BUILD_DIR',       cli: 'servedir',      clis: 'd',  prop: 'servedir',       type: 'path',       default: './',                      help: 'directory to serve' },
    { env: 'RELOAD_SERVICE',  cli: 'reloadservice', clis: 'r',  prop: 'reloadservice',  type: 'path',       default: '/livelocalhost.service',  help: 'path to reload service' },
    { env: 'HOTLOAD_JS',      cli: 'hotloadJS',     clis: 'j',  prop: 'hotloadJS',      type: 'true|false', default: 'false',                   help: 'enable hot reloading of JavaScript files' },
    { env: 'WATCH_DEBOUNCE',  cli: 'watchDebounce', clis: 'w',  prop: 'watchDebounce',  type: 'num',        default: 600,                       help: 'debounce time for file changes' },
    { env: 'ACCESS_LOG',      cli: 'accessLog',     clis: 'l',  prop: 'accessLog',      type: 'true|false', default: false,                     help: 'show server access log' },
    { env: null,              cli: 'version',       clis: 'v',  prop: null,             type: null,         default: null,                      help: 'show application version' },
    { env: null,              cli: 'help',          clis: '?',  prop: null,             type: null,         default: null,                      help: 'show help' },
    { env: null,              cli: 'helpenv',       clis: 'E',  prop: null,             type: null,         default: null,                      help: 'show .env/environment variable help' },
    { env: null,              cli: 'helpapi',       clis: 'A',  prop: null,             type: null,         default: null,                      help: 'show Node.js API help' },
  ],
  helpLink = styleText('cyanBright', 'For help, refer to https://github.com/craigbuckler/livelocalhost');

// default options
let opt = { help: true };

// parse CLI arguments
try {

  const
    args = [...process.argv].slice(2),
    options = {};

  // build CLI options
  config.forEach(o => {
    options[o.cli] = {
      type: !o.type || o.type === 'true|false' ? 'boolean' : 'string'
    };
    if (o.clis) options[o.cli].short = o.clis;
  });

  // parse arguments
  const { values, positionals } = parseArgs({ args, options, strict: true, allowPositionals: true });

  // set port to first positional argument
  if (positionals[0] && !values.serveport) values.serveport = positionals[0];

  // set servedir to second positional argument
  if (positionals[1] && !values.servedir) values.servedir = positionals[1];

  opt = { ...values };

}
catch (err) {
  concol.error( `Error parsing arguments\n${ err.message }` );
}


// show version
if (opt.version) {
  console.log(`${ pkg.version }`);
  process.exit(0);
}


// show CLI help
if (opt.help) {

  console.log(`
${ styleText(['yellowBright'], 'LiveLocalhost CLI help') }

Starts a development server in a local directory with live reload support.
${ helpLink }

CLI usage: ${ styleText(['whiteBright'], 'livelocalhost') + styleText(['dim'], ' [options]') }
           ${ styleText(['whiteBright'], 'llh') + styleText(['dim'], ' [options]') }

Options:

${
  config
    .filter(c => c.cli)
    .map(c => `  ${ (c.clis ? `-${ c.clis }, ` : '    ') }--${ c.cli.padEnd(14) }${ styleText(['dim'], (c.type ? ' <' + c.type + '>' : '').padEnd(13)) } ${ c.help } ${ c.default ? styleText(['dim'], `(${ c.default })`) : '' }`)
    .join('\n')
}

Options can use "--name value" or "--name=value" format.

Example:

  llh --serveport 8080 --servedir=./build/ --reloadservice /reload

The first two non-dashed parameters are presumed to be the port and directory:

  llh 8080 ./build/

`);
}


// show .env help
if (opt.helpenv) {

  console.log(`
${ styleText(['yellowBright'], 'LiveLocalhost environment variable help') }

LiveLocalhost options can be set using environment variables.
Variables can also be defined in a file and loaded with ${ styleText(['dim'], '--env <file>') }

Variables:

${ config
    .filter(c => c.env)
    .map(c => `  ${ c.env }${ styleText(['dim'], (c.type ? '=<' + c.type + '>' : '').padEnd(33 - c.env.length)) } ${ c.help } ${ c.default ? styleText(['dim'], `(${ c.default })`) : '' }`)
    .join('\n')
}
${ styleText(['green'], `
# Example .env file
SERVE_PORT=8080
BUILD_DIR=./dest/
RELOAD_SERVICE=./reload
`) }
Load using:

  ${ styleText(['whiteBright'], 'livelocalhost') + styleText(['dim'], ' --env .env') }

Note that CLI arguments take precedence over environment variables.

${ helpLink }
`);
}


// show API help
if (opt.helpapi) {

  console.log(`
${ styleText(['yellowBright'], 'LiveLocalhost Node.js API help') }

You can use the Node.js API to programmatically launch a server.

Install the module into a Node.js project:

  ${ styleText(['whiteBright'], 'npm install livelocalhost') }

Create a JavaScript file (such as index.js):
${ styleText(['green'], `
  // EXAMPLE CODE
  import { livelocalhost } from 'livelocalhost';

  // configuration
  livelocalhost.serveport = 8080;
  livelocalhost.servedir = './build/index/';
  livelocalhost.reloadservice = './reload';

  // run server
  livelocalhost.start();
`) }
Then run it:

  ${ styleText(['whiteBright'], 'node index.js') }

livelocalhost object configuration properties:

${ config
    .filter(c => c.prop)
    .map(c => `  ${ styleText(['green'], '.' + c.prop) }${ styleText(['dim'], (c.type ? ' = <' + c.type + '>;' : '').padEnd(35 - c.prop.length)) } ${ c.help } ${ c.default ? styleText(['dim'], `(${ c.type != 'num' && c.type != 'true|false' ? '\'' : ''}${ c.default }${ c.type != 'num' && c.type != 'true|false' ? '\'' : ''})`) : '' }`)
    .join('\n')
}

When a value is not defined, livelocalhost falls back to an
environment variable then the default value ${ styleText(['dim'], '(shown in brackets)') }.

${ helpLink }
`);
}

// exit if version or help requested
if (opt.version || opt.help || opt.helpenv || opt.helpapi) {
  process.exit(0);
}

// load .env file
if (opt.env) {
  process.loadEnvFile(opt.env);
}


// set options
config.forEach(c => {

  if (!c.prop) return;

  let value = (c.cli ? opt[c.cli] : undefined) || (c.env ? process.env[c.env] : undefined);

  if (value) {

    switch (c.type) {

      case 'int':
      case 'num':
        value = parseFloat(value.trim());
        break;

    }

    // set property
    livelocalhost[c.prop] = value;

  }

});


// start server
livelocalhost.start();
