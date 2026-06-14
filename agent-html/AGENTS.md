# AgentHTML React Canvas

Write normal React artifacts in `agent-html/artifacts/*.artifact.tsx`. For cold start, read `agent-html/README.md` first, then this file.

## Workspace Rules

- Keep `agent-html` as a portable source workspace.
- Do not add `node_modules`, lockfiles, generated bundles, `.vite`, `dist`, `build`, or vendored dependency folders inside `agent-html`.
- Keep `agent-html/AGENTS.md`, `agent-html/components.json`, and `agent-html/tsconfig.json` at the workspace root for agent, shadcn, TypeScript, and editor discovery.
- Use `agent-html/index` as a generated decision layer. Do not treat temporary declaration or dependency graph output as committed agent context.
- Use `agent-html/package.json` only as source dependency metadata. New third-party dependencies need an explicit source or host owner.

## Documentation Maintenance

- Keep this file focused on hard rules and default behavior.
- Keep `README.md` as the conditional reading route.
- Keep `TASTE.md` as artifact design judgment.
- Use `GOVERNANCE.md` before changing workspace conventions, route files,
  generated indexes, artifact or data patterns, or copyable examples.
- Do not duplicate rules across `README.md`, `AGENTS.md`, `TASTE.md`,
  `GOVERNANCE.md`, source route files, and `index/*`.
- Do not commit full generated graphs, declaration rollups, or tool dumps as agent context.
- Do not manually hard-wrap prose. Use line breaks for Markdown structure, lists, tables, code blocks, and semantic separation only.
- Use short, imperative, operational wording.

## Directory Ownership

- Put artifact source in `artifacts`.
- Put visual primitives in `components/ui`.
- Put single-file rich workflow components in `components/<name>.tsx`; split to `components/<name>/` only after they need multiple files.
- Put reusable React behavior in `hooks`.
- Put pure helpers and transforms in `lib`.
- Put shared source types in `types`.
- Put Canvas CSS, tokens, and style routes in `styles`.
- Put theme preset resources in `theme`; keep preset source CSS in
  `theme/presets` and let the registry normalize it.
- Put bundle-time imports in `assets` only when an artifact needs imported files.
- Put artifact-owned URL static files in `artifacts/<artifact>/public`.
- Put shared URL static files in `public`.

## Artifact Defaults

- Name artifacts by subject, not template, format, or page type.
- Name blocks by semantic work area, not position, layout, or container shape.
- Keep split artifact file names, component names, `Block` ids, and `Block`
  titles aligned to the same work area.
- Keep compact artifacts single-file. Split broad artifacts into
  `name.artifact.tsx` as the artifact entry and `name/*.block.tsx` as semantic
  block files.

## Data Defaults

- Keep artifact data artifact-local by default.
- Use a single `data.ts` only for small data surfaces.
- Split broad data into artifact-local `data/` files by owner.
- Keep generated or raw data separate from authored interpretation.
- Add a shared data owner only when multiple artifacts consume it and a route
  names that owner.

## Artifact Protocol Rules

- Import `defineArtifact` from `@agent-html/react` in
  `artifacts/*.artifact.tsx`.
- Default export `defineArtifact({ title, blocks })` from artifact entries.
- Use artifact entries only for artifact title and block order.
- Put block implementation in `artifacts/<artifact>/<block-id>.block.tsx`.
- Default export the block component from each `*.block.tsx` file.
- Use stable, unique, readable, kebab-case block ids in `blocks`.
- Use string block entries when titleized id is correct.
- Use `{ id, title }` only when the visible block title cannot be inferred
  from the id.
- Put layout and visual treatment inside the block content, local `agent-html/components/ui` primitives, and named rich components when the task needs that workflow.
- Do not render host block prompt actions or block hover chrome from artifact source.
- Do not use old AHTML `<Cell>` DSL for React Canvas artifacts.

## Primitive Rules

- Use local `agent-html/components/ui` for common interactive controls and reusable UI roles.
- Use named rich components, `hooks`, `lib`, and `types` when they fit the artifact task.
- Check `index/api-surface.md` before adding, duplicating, or changing a local primitive or reusable helper.
- Host and artifacts compose primitives. They do not create duplicate primitive buttons, inputs, menus, dialogs, or other common controls.
- Keep local shadcn-derived primitives low-modification unless Canvas needs a primitive API, correctness fix, or accessibility fix.
- Treat the sidebar as a component family. Use sidebar primitives and sidebar tokens for sidebar chrome only.
- Treat prompt UI as a disclosure surface. Floating panels use popover tokens, not sidebar tokens.

## Style Rules

- Use `styles/public/content.css` L2 composition classes when they fit ordinary artifact content styling.
- Use semantic token utilities such as `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-popover`, and `text-popover-foreground` when applying token-backed treatment.
- Keep layout behavior classes such as `flex`, `grid`, `min-w-0`, `overflow-hidden`, `flex-wrap`, `shrink-0`, and `truncate` local to the composition that needs them.
- Do not use raw palette classes, arbitrary value classes, or inline visual styles in artifacts.
- Do not recreate root reading width, block hover highlighting, toolbar placement, sidebar chrome, or theme editor chrome in artifact source.
- Keep text, code, generated output, and data values selectable. Chrome, navigation rows, badges, and block action controls may disable accidental selection through primitives.

## Asset Rules

- Create `agent-html/assets` only for imported images, media, and bundle-time files, then import them with relative `../assets/...` paths.
- Put artifact-owned URL static files in `agent-html/artifacts/<artifact>/public` and reference them with `artifactPublicUrlFactory` from `agent-html/lib/public-url`.
- Put only shared URL static files in `agent-html/public` and reference them with `sharedPublicUrl` from `agent-html/lib/public-url`.
- Do not import from `../public` or `./public`.

## Forbidden Imports And Actions

- Do not call Codex app-server, the filesystem, shell commands, MCP servers, or privileged host APIs from artifact code.
- Do not import `@/app/*`, `apps/agent-html-app`, `@/agent-html/runtime/ui`, `renderAgentHtml`, or `renderInteractiveAgentHtml`.
- Do not import Canvas host internals from artifact source.

## Route Safeguards

- Read the owner route before broad source scans.
- Use `TASTE.md` before changing artifact visual composition, media-heavy
  blocks, layout density, component choice, source placement, or narrative UI.
