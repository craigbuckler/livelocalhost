// live reload client-side script for livelocalhost
new EventSource('_reloadSSE_').addEventListener('change', e => {

  const
    changed = JSON.parse(e.data),
    d = +new Date();

  if (
    // active page reload
    changed.includes( location.pathname.slice(1) + 'index.html' ) ||

    // hot reload JS
    (_hotloadJS_ && changed.some(c => c.endsWith('.js')))
  ) {
    location.reload();
    return;
  }

  // hot reload CSS
  Array.from(document.getElementsByTagName('link')).forEach(link => {

    const url = new URL(link.href), path = url.pathname;

    if (changed.includes(path.slice(1)) && url.host === location.host) {

      const css = link.cloneNode();
      css.onload = () => link.remove();
      css.href = `${ path }?${ d }`;
      link.after(css);

    }

  });

});
