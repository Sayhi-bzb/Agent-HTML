# React Canvas Workspace

`agent-html` is a portable Canvas source workspace. It contains durable artifact source, local primitives, styles, examples, data, assets, and source dependency metadata. It does not contain runtime install artifacts.

## Read Route

Always:

- `AGENTS.md` for hard operating rules.
- `index/README.md` for generated route summaries.

When authoring an artifact:

- `artifacts/README.md`
- `examples/example.artifact.tsx`

When opening broad or large source files:

- `index/large-files.md`
- `index/dependency-summary.md`

When using or changing primitives, hooks, helpers, schemas, or theme exports:

- `components/README.md` for the component source route.
- `index/reuse-surface.md` for reusable hook, helper, schema, and data choices.
- `index/api-surface.md`
- then the closest source file

When using fixtures or local datasets:

- `data/README.md`
- `index/reuse-surface.md`
- `index/api-surface.md`
- then the closest source file

When touching Canvas classes, tokens, or internal chrome:

- `styles/README.md`

## Source Placement

- `artifacts`: artifact source.
- `examples`: compact patterns to imitate.
- `components/ui`: local visual primitives.
- `components/<name>.tsx`: single-file rich workflow components such as kanban.
- `hooks`: reusable React behavior.
- `lib`: pure helpers and transforms.
- `schema`: typed contracts and validation.
- `styles`: CSS pipeline and Canvas style API.
- `theme`: host-owned theme preset resources.
- `data`: fixtures and local datasets.
- `assets`: bundle-time imports.
- `public`: URL-addressed static files.

## Copy Policy

- Copy `examples/example.artifact.tsx` for artifacts that need an artifact entry and semantic block files.
- Use `artifacts/README.md` before opening large artifact source.
- Use `artifacts/test.artifact.tsx` as a compact interaction example, `components/README.md` for the component source route, and `docs/ui/README.md` for component choice.

## Workspace Contract

`agent-html/package.json` is source dependency metadata, not a standalone install target. Canvas CLI and host packages provide the runtime React, bundling, stylesheet, icon, and preview environment.

Do not add `node_modules`, lockfiles, generated bundles, `.vite`, `dist`, `build`, or vendored dependency folders inside `agent-html`.
