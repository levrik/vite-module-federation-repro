# Vite Module Federation Subpath Repro

Minimal standalone repro for a Vite + `@module-federation/vite` bug that shows up when the dev server is deployed behind a reverse proxy under a subpath.

## Setup

```bash
npm install
```

`vite.config.ts` sets `base: '/subpath'` and configures `@module-federation/vite` as a host. It also has its own `server.proxy` rule that rewrites any request not already starting with `/subpath` to prepend `/subpath` and re-requests itself — this lets the dev server also respond when hit at the plain root path.

`proxy.js` is a small standalone Node process, built on `http-proxy-3` (the same library Vite uses internally for `server.proxy`), that sits in front of the Vite dev server. It strips a leading `/subpath` from every incoming request path before forwarding to Vite — modeling a real-world reverse proxy/ingress that exposes the app externally under `/subpath` while forwarding path-stripped requests to the origin server, a common deployment pattern.

Run both in separate terminals:

```bash
npm run dev    # Vite dev server on http://localhost:5174
npm run proxy  # standalone proxy on http://localhost:5175, strips /subpath, forwards to 5174
```

## The bug

When a request reaches Vite without the `/subpath` prefix already present in its path — which happens whenever it's routed through the standalone reverse proxy (which strips the prefix) — the `virtual:mf-html-entry-proxy` module that `@module-federation/vite` generates (the module federation host-init bootstrap) omits the `/subpath` base prefix from its own import specifiers. Fetching that same module directly against Vite (where the request path still carries `/subpath`) produces the correct, prefixed imports.

**To reproduce:**

1. `npm run dev`
2. `npm run proxy`
3. Fetch the entry-proxy virtual module through the standalone proxy:
   ```bash
   curl "http://localhost:5175/subpath/@id/__x00__virtual:mf-html-entry-proxy?init=%2F%40id%2Fvirtual%3Amf%3A__mfe_internal__host__mf_owner__1__H_A_I__hostAutoInit__H_A_I__.js&entry=%2Fsrc%2Fmain.tsx"
   ```

**Expected** (this is what you get fetching the same URL directly against Vite on port 5174 instead of through the proxy): imports keep the `/subpath` prefix.

```js
(async () => {
  const __mfHostInit = await import("/subpath/@id/virtual:mf:__mfe_internal__host__mf_owner__1__H_A_I__hostAutoInit__H_A_I__.js");
  await __mfHostInit.__tla;
  const { initHost } = __mfHostInit;
  await initHost();
  if (__mfModuleCache.pendingShareLoads) {
    await Promise.all(__mfModuleCache.pendingShareLoads);
  }
})().then(() => import("/subpath/src/main.tsx"));
```

**Actual:** through the standalone proxy, the `/subpath` prefix is missing entirely.

```js
(async () => {
  const __mfHostInit = await import("/@id/virtual:mf:__mfe_internal__host__mf_owner__1__H_A_I__hostAutoInit__H_A_I__.js");
  await __mfHostInit.__tla;
  const { initHost } = __mfHostInit;
  await initHost();
  if (__mfModuleCache.pendingShareLoads) {
    await Promise.all(__mfModuleCache.pendingShareLoads);
  }
})().then(() => import("/src/main.tsx"));
```

Since the base prefix is missing, the browser ends up requesting these modules at the wrong (un-proxied) paths, and the app fails to load.
