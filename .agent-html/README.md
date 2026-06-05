# React Canvas Workspace

`.agent-html` is a portable Canvas source workspace. It contains durable artifact source, local primitives, styles, examples, data, assets, and source dependency metadata. It does not contain runtime install artifacts.

## Read Route

Always:

- `AGENTS.md` for hard operating rules.
- `index/README.md` for generated route summaries.

When authoring a static artifact:

- `examples/research-summary.agent.tsx`

When adding instrumented controls:

- `examples/interaction-state.agent.tsx`

When opening broad or large source files:

- `index/large-files.md`
- `index/dependency-summary.md`

When using or changing primitives, hooks, helpers, schemas, or theme exports:

- `index/api-surface.md`
- then the closest source file

When touching Canvas classes, tokens, or internal chrome:

- `styles/README.md`

## Source Placement

- `artifacts`: artifact source.
- `examples`: compact patterns to imitate.
- `ui`: local visual primitives.
- `hooks`: reusable React behavior.
- `lib`: pure helpers and transforms.
- `schema`: typed contracts and validation.
- `styles`: CSS pipeline and Canvas style API.
- `theme`: host-owned theme preset resources.
- `data`: fixtures and local datasets.
- `assets`: bundle-time imports.
- `public`: URL-addressed static files.

## Copy Policy

- Copy `examples/research-summary.agent.tsx` for compact static artifacts.
- Copy `examples/interaction-state.agent.tsx` for compact interaction-state artifacts.
- Do not copy `artifacts/interaction-state.agent.tsx` as a style template; it is a broad coverage surface.

## Workspace Contract

`.agent-html/package.json` is source dependency metadata, not a standalone install target. Canvas CLI and host packages provide the runtime React, bundling, stylesheet, icon, and preview environment.

Do not add `node_modules`, lockfiles, generated bundles, `.vite`, `dist`, `build`, or vendored dependency folders inside `.agent-html`.
