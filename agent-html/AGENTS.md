# AgentHTML React Canvas

For cold start, read `agent-html/README.md` first, then this file. This file owns hard operating rules and strong defaults.

## Workspace Boundaries

- Keep `agent-html` as a portable source workspace.
- Do not add `node_modules`, lockfiles, generated bundles, `.vite`, `dist`, `build`, vendored dependency folders, full graphs, declaration rollups, or tool dumps inside `agent-html`.
- Keep `AGENTS.md`, `components.json`, and `tsconfig.json` at the workspace root for agent, shadcn, TypeScript, and editor discovery.
- Use `index/*` only as generated decision context. Do not edit generated index files by hand.
- `package.json` is generated source dependency metadata. Change the Kernel
  runtime catalog, then run `npm run canvas:catalog:sync`; do not edit dependency
  versions here by hand.
- Use `GOVERNANCE.md` before changing workspace conventions, route files, generated indexes, artifact or data patterns, or copyable examples.

## Artifact Protocol

- Put artifact entries in `artifacts/*.artifact.tsx`.
- Import `defineArtifact` from `@agent-html/react`.
- Default export `defineArtifact({ title, blocks })` from artifact entries.
- Use artifact entries only for artifact title and block order.
- Put split block implementations in `artifacts/<artifact>/<block-id>.block.tsx`.
- Default export the block component from each `*.block.tsx` file.
- Use stable, unique, readable, kebab-case block ids.
- Use `{ id, title }` only when the visible block title cannot be inferred from the id.
- Do not render host block prompt actions or block hover chrome from artifact source.
- Do not use old AHTML `<Cell>` DSL for React Canvas artifacts.

## Source Ownership

- Put common visual primitives in `components/ui`.
- Put rich reusable components in `components/<name>.tsx` or `components/<name>/`.
- Put reusable React behavior in `hooks`, pure helpers in `lib`, shared contracts in `types` or `schema`, and Canvas CSS in `styles`.
- Keep artifact data artifact-local unless multiple artifacts consume it and a route names the shared owner.
- Keep generated or raw data separate from authored interpretation.
- Put bundle-time imports in `assets`, artifact-owned URL files in `artifacts/<artifact>/public`, and shared URL files in `public`.
- Reference artifact URL files with `artifactPublicUrlFactory` and shared URL files with `sharedPublicUrl`.
- Do not import from `../public` or `./public`.

## API And Style Safeguards

- Check `index/api-surface.md` before adding, duplicating, or changing a local primitive, hook, helper, schema, or shared component.
- Check `index/style-surface.md` before adding or changing artifact-facing Canvas classes.
- Use `styles/layouts/index.css` L2 composition classes when they fit ordinary artifact content styling.
- Do not use raw palette classes, arbitrary value classes, or inline visual styles in artifacts.
- Do not recreate root reading width, block hover highlighting, toolbar placement, sidebar chrome, or theme editor chrome in artifact source.
- Treat every `agent-html validate` diagnostic as blocking. Kernel rules cannot
  be disabled or suppressed from workspace source.
- Use `TASTE.md` before changing artifact visual composition, media-heavy blocks, layout density, component choice, source placement, or narrative UI.

## Forbidden Imports And Actions

- Do not call Codex app-server, the filesystem, shell commands, MCP servers, or privileged host APIs from artifact code.
- Do not import `@/app/*`, `apps/agent-html-app`, `@/agent-html/runtime/ui`, `renderAgentHtml`, or `renderInteractiveAgentHtml`.
- Do not import Canvas host internals from artifact source.
