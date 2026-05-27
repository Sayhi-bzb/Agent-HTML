# Deployment

This document defines how to build and deploy the standalone Agent-HTML example
website. It exists to prevent deploying the app shell by accident.

## Ownership

The example website is a separate frontend surface:

```text
apps/agent-html-example
  -> src/app
  -> src/cases
  -> src/features
  -> src/theme
  -> src/ui
  -> public
```

It may import Agent-HTML runtime APIs from `packages/agent-html`. It must not import
`apps/agent-html-app/src`, app CSS, or app-shell assets.

The deploy output is always:

```text
dist-agent-html
```

Do not deploy:

- `dist`
- `public`
- `apps/agent-html-example`
- repository root

Those directories either belong to the app shell, source code, or unbuilt static
assets.

## Local Development

From the repository root:

```powershell
npm run dev:example
```

From the example app directory:

```powershell
cd apps\agent-html-example
npm run dev
```

Both commands must render the example website, not the app shell. If `/` shows
the app shell, the wrong Vite config is running.

Expected local routes:

- `/` renders the English example route.
- `/zh` renders the Chinese example route.
- `/agent-html/` redirects to `/`.
- `/agent-html/zh` redirects to `/zh`.

## Build

From the repository root:

```powershell
npm run build:example
npm run verify:example-build
```

From the example app directory:

```powershell
cd apps\agent-html-example
npm run build
npm run verify
```

The build command type-checks with `tsconfig.agent-html-example.json`, then uses
`apps/agent-html-example/vite.config.ts`.

`apps/agent-html-example/vite.config.ts` is the source of truth for:

- Vite root: `apps/agent-html-example`
- public directory: `apps/agent-html-example/public`
- output directory: `dist-agent-html`
- `@example` alias: `apps/agent-html-example/src`

The root `vite.agent-html.config.ts` only exists as a compatibility re-export.
Do not add new example deployment rules there.

## Cloudflare Pages Deploy

The Cloudflare Pages project for the public example is:

```text
agent-html
```

Its public URL is:

```text
https://agent-html.pages.dev/
```

Deploy the built static output:

```powershell
npm run build:example
npm run verify:example-build
npx wrangler pages deploy dist-agent-html --project-name agent-html --branch main
```

For a preview deployment, change only the branch:

```powershell
npx wrangler pages deploy dist-agent-html --project-name agent-html --branch preview
```

Do not use `wrangler deploy`; that is for Workers. This project is a Pages
static asset deployment.

## Cloudflare Dashboard Settings

If the Pages project is connected to Git builds, use these settings:

```text
Build command: npm run build:example
Build output directory: dist-agent-html
Root directory: /
```

The output directory must stay `dist-agent-html`. If the dashboard points to
`dist`, the deployment will serve the app shell instead of the example website.

## Routing

The example website is a Vite single-page app. The route fallback lives in:

```text
apps/agent-html-example/public/_redirects
```

Current rule:

```text
/agent-html/zh /zh 301
/agent-html/* / 301
/* /index.html 200
```

Keep this file under the example app public directory. Do not move it back to
repository-level `public`, because that would couple example deployment to the
app shell.

## Pre-Deploy Checklist

Before deploying:

- `npm run build:example` passes.
- `npm run verify:example-build` passes.
- `dist-agent-html/index.html` exists.
- The generated bundle does not contain app-only markers such as `Gallery` or
  `Design Engineering`.
- `apps/agent-html-example` does not import `@/app`,
  `apps/agent-html-app/src`, or app CSS.
- `apps/agent-html-example/public/_redirects` exists.

## Common Failure Modes

If `https://agent-html.pages.dev/` shows the app shell, the wrong directory was
deployed. Rebuild and deploy `dist-agent-html`.

If `npm run dev` inside `apps/agent-html-example` shows the app shell, the
example app is missing its local `package.json` or `vite.config.ts`.

If the Chinese route works locally but 404s on Pages, check that
`apps/agent-html-example/public/_redirects` was copied into `dist-agent-html`.

If `wrangler pages deploy` uploads but the site does not change, confirm the
project name is `agent-html` and the branch is the intended production branch.
