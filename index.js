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
  helpLink = styleText('cyanBright', 'For help, refer to https://www.npmjs.com/package/livelocalhost');

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
${ styleText('yellowBright', 'LiveLocalhost CLI help') }
Start a development web server from a local directory with hot reloading.
${ helpLink }

no install: ${ styleText('whiteBright', 'npx livelocalhost') + styleText('dim', ' [options]') }

or install: ${ styleText('whiteBright', 'npm install livelocalhost -g') }
  then run: ${ styleText('whiteBright', 'livelocalhost') + styleText('dim', ' [options]') }
        or: ${ styleText('whiteBright', 'llh') + styleText('dim', ' [options]') }

Options:

${
  config
    .filter(c => c.cli)
    .map(c => `  ${ (c.clis ? `-${ c.clis }, ` : '    ') }--${ c.cli.padEnd(14) }${ styleText('dim', (c.type ? ' <' + c.type + '>' : '').padEnd(13)) } ${ c.help } ${ c.default !== null ? styleText('dim', `(${ c.default })`) : '' }`)
    .join('\n')
}

Serve files from ./build/ at http://localhost:8080 and show the access log:

  ${ styleText('whiteBright', 'llh') + styleText('dim', ' --serveport 8080 -d ./build/ -l') }

The first two non-dashed parameters are presumed to be the port and directory:

  ${ styleText('whiteBright', 'llh') + styleText('dim', ' 8080 ./build/ -l') }

Stop the server with ${ styleText('dim', 'Ctrl|Cmd + C') }
`);
}


// show .env help
if (opt.helpenv) {

  console.log(`
${ styleText('yellowBright', 'LiveLocalhost environment variable help') }
The server can be configured with environment variables.

Variables:

${ config
    .filter(c => c.env)
    .map(c => `  ${ c.env }${ styleText('dim', (c.type ? '=<' + c.type + '>' : '').padEnd(33 - c.env.length)) } ${ c.help } ${ c.default !== null ? styleText('dim', `(${ c.default })`) : '' }`)
    .join('\n')
}

Variables can be defined in a file, e.g.
${ styleText('green', `
  # example .env file
  SERVE_PORT=8080
  BUILD_DIR=./build/
  ACCESS_LOG=true
`) }
then loaded:

  ${ styleText('whiteBright', 'llh') + styleText('dim', ' --env .env') }

Note that CLI arguments take precedence over environment variables.

${ helpLink }
`);
}


// show API help
if (opt.helpapi) {

  console.log(`
${ styleText('yellowBright', 'LiveLocalhost Node.js API help') }
You can use LiveLocalhost in any Node.js project.

Install in your project:

  ${ styleText('whiteBright', 'npm install livelocalhost --save-dev') }

${ styleText(['dim','italic'], '(--save-dev ensures it\'s only available in development)') }

Import the module into any JavaScript file (such as index.js):
${ styleText('green', `
  // EXAMPLE CODE
  import { livelocalhost } from 'livelocalhost';

  // configuration
  livelocalhost.serveport = 8080;
  livelocalhost.servedir  = './build/';
  livelocalhost.accessLog = true;

  // run server
  livelocalhost.start();
`) }
Then run it:

  ${ styleText('whiteBright', 'node index.js') }

${ styleText('green', 'livelocalhost') } object configuration properties:

${ config
    .filter(c => c.prop)
    .map(c => `  ${ styleText('green', '.' + c.prop.padEnd(13, ' ')) }${ styleText('dim', (c.type ? ' = <' + c.type + '>;' : '').padEnd(17)) } ${ styleText(['green','dim'], '// ' + c.help) } ${ c.default !== null ? styleText('dim', `(${ c.type === 'path' ? '\'' : ''}${ c.default }${ c.type === 'path' ? '\'' : ''})`) : '' }`)
    .join('\n')
}

${ styleText(['dim','italic'], '(If not set, options fall back to environment variables then defaults.)') }

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
