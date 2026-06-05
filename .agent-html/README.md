# React Canvas Workspace

`.agent-html` is a portable Canvas source workspace.

It contains durable source, agent instructions, local primitives, semantic
tokens, examples, data, assets, and source dependency metadata. It does not
contain runtime install artifacts.

## Read First

1. Read `AGENTS.md` for the operating rules.
2. Read `index/README.md` for generated large-file routes, dependency
   summaries, and compact API surfaces.
3. Read `examples/research-summary.agent.tsx` for the smallest canonical
   artifact shape.
4. Read `examples/interaction-state.agent.tsx` only when adding instrumented
   artifact controls.
5. Read `styles/README.md` before touching Canvas classes, tokens, or internal
   chrome styles.
6. Read the closest local primitive in `ui/*` before hand-writing common UI.

## Authoring Flow

- Write normal React artifacts in `artifacts/*.agent.tsx`.
- Import `Artifact` and `Block` from `@agent-html/react`.
- Wrap every major semantic region in a stable, literal, kebab-case `Block`.
- Compose local primitives from `../ui/*` and Canvas semantic classes.
- Use `index/large-files.md`, `index/dependency-summary.md`, and
  `index/api-surface.md` before opening large source files.
- Put reusable behavior in `hooks`, pure transforms in `lib`, schemas in
  `schema`, fixtures in `data`, bundle imports in `assets`, and URL-addressed
  static files in `public`.

## What to Imitate

- `examples/research-summary.agent.tsx` for a compact static artifact.
- `examples/interaction-state.agent.tsx` for a compact interaction-state
  artifact.
- `artifacts/project-visual-explainer.agent.tsx` for a multi-block artifact
  that explains Canvas boundaries.

`artifacts/interaction-state.agent.tsx` is a coverage surface for primitives,
interaction instrumentation, and guard behavior. Do not use its size or breadth
as a style template.

## Dependency Ownership

`.agent-html/package.json` is source dependency metadata for the portable
workspace. It is not a standalone install target.

- Workspace-local primitives may list source dependencies there.
- Canvas CLI and host packages provide the runtime React, bundling, stylesheet,
  icon, and preview environment.
- Artifact authors should prefer existing local `ui`, `hooks`, `lib`, `schema`,
  `data`, and `assets` before adding dependencies.
- New third-party dependencies need an explicit owner: source-only workspace
  metadata when local Canvas source imports them, or CLI/host package
  dependencies when the runtime host must provide them.

Do not add `node_modules`, lockfiles, generated bundles, `.vite`, `dist`,
`build`, or vendored dependency folders inside `.agent-html`.
