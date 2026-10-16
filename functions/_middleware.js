// Cloudflare Pages publishes the whole repo root, so files that aren't part of
// the site (docs, scripts, dotfiles) would be public. _routes.json sends only
// those paths here; everything else is served as a static asset without
// invoking this function. _redirects can't do this: Pages rejects a 404 status
// in a redirect rule (WEB-18).
export const onRequest = () => new Response('Not found', { status: 404 });
