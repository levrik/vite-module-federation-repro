# Vite Module Federation Repro

Minimal standalone repro for debugging Vite module federation.

This is an npm workspace with two packages:

- `packages/host` — the host app, running on port 5174
- `packages/remote` — the remote app, exposing a module at its root (`.`), running on port 5001

## Setup

```bash
npm install
```

Run both dev servers in separate terminals:

```bash
npm run dev:remote
npm run dev:host
```

## The bug

A remote module exposed on the root entry (`.`) cannot be statically imported from the host.

`packages/remote/vite.config.ts` exposes:

```ts
exposes: {
    '.': './src/index.ts',
},
```

`packages/host/src/main.ts` consumes it with a normal static import:

```ts
import { helloWorld } from 'remote';

helloWorld();
```

**To reproduce:**

1. Start both dev servers (`npm run dev:remote`, `npm run dev:host`).
2. Open the host at http://localhost:5174.

**Expected:** the page loads and `helloWorld()` runs, logging to the console.

**Actual:** the host fails to load. The browser console shows:

```
(index):1 Uncaught (in promise) Promise {<pending>}
```

**Workarounds that avoid the bug:**

- Using a dynamic import instead of a static one works:
  ```ts
  const { helloWorld } = await import('remote');
  helloWorld();
  ```
- Exposing on a subpath instead of the root also works:
  ```ts
  exposes: {
      './helloWorld': './src/index.ts',
  },
  ```
  ```ts
  import { helloWorld } from 'remote/helloWorld';
  ```

So the failure is specific to a *static* import of a *root* (`.`) expose.
