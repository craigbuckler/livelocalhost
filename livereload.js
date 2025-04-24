// live reload client-side script for livelocalhost
new EventSource('_reloadSSE_').addEventListener('change', e => {

  const
    changed = JSON.parse(e.data),
    d = +new Date();

  if (
    changed.includes( location.pathname.slice(1) + 'index.html' ) ||
    (_hotloadJS_ && changed.some(c => c.endsWith('.js')))
  ) {

    // full reload on active page or JS change
    location.reload();

  }
  else if (changed.some(c => c.endsWith('.css'))) {

    // hot reload all CSS
    Array.from(document.getElementsByTagName('link')).forEach(link => {

      const url = new URL(link.href);
      if (link.rel === 'stylesheet' && url.host === location.host) {

        const css = link.cloneNode();
        css.onload = () => link.remove();
        css.href = `${ url.pathname }?${ d }`;
        link.after(css);

      }

    });

  }

});
