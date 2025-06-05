// LiveLocalhost class
import process from 'node:process';
import http from 'node:http';
import { isAbsolute, join, normalize, extname, sep } from 'node:path';
import { parse } from 'node:url';
import { access, stat, readFile } from 'fs/promises';
import { constants as fsConstants } from 'fs';
import { watch } from 'node:fs';
import { styleText } from 'node:util';

import { ConCol } from 'concol';

import { mimeType } from './mimetype.js';

export const concol = new ConCol('LiveLocalhost', 'green');

class LiveLocalhost {

  // defaults
  serveport = parseFloat(process.env.SERVE_PORT  || 8000);
  servedir = process.env.BUILD_DIR || './';
  reloadservice = process.env.RELOAD_SERVICE || '/livelocalhost.service';
  hotloadJS = (process.env.HOTLOAD_JS?.toLowerCase() === 'true');
  watchDebounce = parseFloat(process.env.WATCH_DEBOUNCE  || 600);
  accessLog = (process.env.ACCESS_LOG?.toLowerCase() === 'true');

  // server directory
  #serverDir = null;

  // cached files
  #modMap = new Map();
  #bufMap = new Map();
  #resSet = new Set();

  // start server
  async start() {

    // server directory
    this.#serverDir = isAbsolute(this.servedir) ? join(this.servedir) : join(process.cwd(), this.servedir);

    const
      serverDirInfo = await fileInfo(this.#serverDir),
      reloadSSE = this.reloadservice,
      reloadJS = reloadSSE ? reloadSSE + '.js' : null;

    // server directory does not exist?
    if (!serverDirInfo.exists) {
      throw new Error(`server directory does not exist: ${ this.#serverDir }`);
    }

    // load JavaScript file
    const reloadJScode = reloadJS ?
      (await readFile(join(import.meta.dirname, 'livereload.js'), { encoding: 'utf8' }))
        .replace('_reloadSSE_', reloadSSE)
        .replace('_hotloadJS_', String( this.hotloadJS ))
      : '';

    // start HTTP server
    http.createServer(async (req, res) => {

      // get requested path
      const path = parse( req.url )?.pathname;

      // no or invalid path
      if (!path || path !== normalize(path).replaceAll(sep, '/')) {
        serve(403, 'Forbidden');
        if (this.accessLog) concol.error(styleText('redBright', `403 ${ path }`));
        return;
      }

      // live reload Server Sent Event
      if (reloadSSE && path === reloadSSE) {

        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        });

        // store session
        this.#resSet.add(res);

        // close connection
        res.on('close', () => {
          this.#resSet.delete(res);
        });

        return;

      }

      // live reload script
      if (reloadJS && path === reloadJS) {
        serve(200, reloadJScode, '.js');
        if (this.accessLog) concol.log(`200 ${ path }`);
        return;
      }

      // file available?
      let
        filename = join(this.#serverDir, path),
        fInfo = await fileInfo(filename);

      // append index.html to directory
      if (fInfo.isDir) {
        filename = join(filename, 'index.html');
        fInfo = await fileInfo(filename);
      }

      // file not available?
      if (!fInfo.exists || !fInfo.canRead) {
        serve(404, 'Not Found');
        if (this.accessLog) concol.log(styleText('redBright', `404 ${ path }`));
        return;
      }

      // get file extension
      const ext = extname(filename);

      // read and serve file
      try {

        const lastMod = this.#modMap.get(filename);

        // get uncached file
        if (!lastMod || lastMod !== fInfo.modified) {

          let content = await readFile(filename);

          // add livereload script to HTML files
          if (ext.includes('htm')) {
            content = content
              .toString()
              .replace('</head>', `<script type="module" src="${ reloadJS }"></script>\n</head>`);
          }

          // cache file
          this.#modMap.set(filename, fInfo.modified);
          this.#bufMap.set(filename, content);
        }

        // serve cached file
        serve(200, this.#bufMap.get(filename), ext);
        if (this.accessLog) concol.log(`200 ${ path }`);

      }
      catch (e) {
        serve(500, 'Internal Server Error');
        if (this.accessLog) concol.error(styleText('redBright', `500 ${ path }\n${ e }`));
      }

      // serve content
      function serve(code, content, type) {

        res.writeHead(code, {
          'Content-Type': mimeType.get(type) || mimeType.get('error'),
          'Cache-Control': 'must-revalidate, max-age=0',
          'Content-Length': Buffer.byteLength(content)
        });
        res.write( content );
        res.end();

      }

    }).listen( this.serveport );

    // start file watcher
    if (reloadSSE) {
      this.#watcher();
    }

    // server started
    const status = [
      [ 'development server started', `http://localhost:${ this.serveport }` ],
      [ 'using files in directory', this.#serverDir ],
    ];

    if (reloadSSE) {
      status.push(
        [ 'live reload service', reloadSSE ],
        [ 'live reload script', reloadJS ],
        [ 'live reload JavaScript', (this.hotloadJS ? 'enabled' : 'disabled') ],
      );
    }
    else {
      status.push(
        [ 'live reload service', 'not active' ]
      );
    }

    status.push(
      [ 'access logs', (this.accessLog ? 'enabled' : 'disabled') ]
    );

    concol.log( status );

  }


  // start file watcher
  #watcher() {

    const
      changed = new Set(), // file changes
      watchFn = livereload.bind(this),
      watchDebounce = this.watchDebounce || 600;

    // watch for file changes
    watch(this.#serverDir, { recursive: true }, (event, file) => {
      changed.add(file);
      wait();
    });

    // file change debounce
    let watchTimer;
    function wait() {
      clearTimeout(watchTimer);
      watchTimer = setTimeout(watchFn, watchDebounce);
    }

    // trigger livereload
    function livereload() {

      const cFiles = [...changed];
      changed.clear();

      // notify all Server-Sent Event clients
      this.#resSet.forEach(res => {
        res.write(`event: change\ndata: ${ JSON.stringify(cFiles) }\n\n`);
      });

      if (this.accessLog) concol.log(styleText('yellow', `SSE file change (${ cFiles.length })`));

    }

  }


}


// export server object
export const livelocalhost = new LiveLocalhost();


// get file information
async function fileInfo(path) {

  const info = {
    exists: false,
    canRead: false
  };

  try {
    const i = await stat(path);

    info.exists = true;
    info.isFile = i.isFile();
    info.isDir = i.isDirectory();
    info.modified = i.mtimeMs;

  }
  catch (e) {
    return info;
  }

  try {
    await access(path, fsConstants.R_OK);
    info.canRead = true;
  }
  catch (e) {}

  return info;

}
