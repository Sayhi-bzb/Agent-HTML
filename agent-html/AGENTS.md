# AgentHTML React Canvas

Write normal React artifacts in `agent-html/artifacts/*.artifact.tsx`. For cold start, read `agent-html/README.md` first, then this file.

## Workspace Rules

- Keep `agent-html` as a portable source workspace.
- Do not add `node_modules`, lockfiles, generated bundles, `.vite`, `dist`, `build`, or vendored dependency folders inside `agent-html`.
- Keep `agent-html/AGENTS.md`, `agent-html/components.json`, and `agent-html/tsconfig.json` at the workspace root for agent, shadcn, TypeScript, and editor discovery.
- Use `agent-html/index` as a generated decision layer. Do not treat temporary declaration or dependency graph output as committed agent context.
- Use `agent-html/package.json` only as source dependency metadata. New third-party dependencies need an explicit source or host owner.

## Documentation Maintenance

- Keep `README.md` as a conditional reading route, not a rulebook.
- Keep `AGENTS.md` as hard executable rules, not a design essay.
- Keep `TASTE.md` as artifact design judgment, not a hard-rule file or
  primitive catalog.
- Keep `index/*` as generated decision summaries, not full tool output.
- Keep `artifacts/README.md` as the artifact source route.
- Keep `data/README.md` as the data source route.
- Keep `styles/README.md` as the style route.
- Do not add a new `agent-html` doc unless it owns a distinct question.
- Do not duplicate rules across README, AGENTS, index, and styles docs. Link to the owning file instead.
- Do not commit full generated graphs, declaration rollups, or tool dumps as agent context.
- Do not manually hard-wrap prose. Use line breaks for Markdown structure, lists, tables, code blocks, and semantic separation only.
- Use short, imperative, operational wording.

## Directory Ownership

- Put artifact source in `artifacts`.
- Put visual primitives in `components/ui`.
- Put single-file rich workflow components in `components/<name>.tsx`; split to `components/<name>/` only after they need multiple files.
- Put reusable React behavior in `hooks`.
- Put pure helpers and transforms in `lib`.
- Put typed contracts and validation in `schema`.
- Put Canvas CSS, tokens, and style routes in `styles`.
- Put theme preset resources in `theme`; keep preset source CSS in
  `theme/presets` and let the registry normalize it. Put preset layout metadata
  in matching `*.layout.ts` modules.
- Put fixtures and local datasets in `data`.
- Put bundle-time imports in `assets`.
- Put URL-addressed static files in `public`.

## Artifact Rules

- Import `Artifact` and `Block` from `@agent-html/react`.
- Use `Artifact` as the top-level wrapper.
- Keep `Artifact` static and unstyled.
- Use only the supported `Artifact` props: `title` and children.
- Wrap every major semantic region in `Block`.
- Use stable, unique, readable, kebab-case block ids.
- Keep compact artifacts single-file. Split broad artifacts into `name.artifact.tsx` as the artifact entry and `name/*.block.tsx` as semantic block files.
- Keep `Block` protocol-only. Use only `id`, `title`, and children.
- Do not put `className`, `style`, layout, border, radius, shadow, spacing, width, padding, or color props on `Artifact` or `Block`.
- Put layout and visual treatment inside the block content, local `agent-html/components/ui` primitives, and named rich components when the task needs that workflow.
- Do not render host block prompt actions or block hover chrome from artifact source.
- Do not use old AHTML `<Cell>` DSL for React Canvas artifacts.

## Taste Route

- Read `TASTE.md` before changing artifact visual composition, media-heavy
  blocks, layout density, component choice, source placement, or narrative UI.
- Use `TASTE.md` for design judgment. Do not copy its guidance into `AGENTS.md`,
  component docs, or generated indexes.

## Primitive Rules

- Read `components/README.md` before scanning component source.
- Use local `agent-html/components/ui` for common interactive controls and reusable UI roles.
- Use named rich components, `hooks`, `lib`, `schema`, `data`, and `assets` when they fit the artifact task.
- Check `index/api-surface.md` before adding, duplicating, or changing a local primitive.
- Host and artifacts compose primitives. They do not create duplicate primitive buttons, inputs, menus, dialogs, or other common controls.
- Keep local shadcn-derived primitives low-modification unless Canvas needs a primitive API, correctness fix, or accessibility fix.
- Treat the sidebar as a component family. Use sidebar primitives and sidebar tokens for sidebar chrome only.
- Treat prompt UI as a disclosure surface. Floating panels use popover tokens, not sidebar tokens.

## Style Rules

- Read `styles/README.md` before touching Canvas classes, tokens, or internal chrome.
- Use `styles/public/content.css` classes when they fit ordinary artifact content styling.
- Use semantic token utilities such as `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-popover`, and `text-popover-foreground` when applying token-backed treatment.
- Keep layout behavior classes such as `flex`, `grid`, `min-w-0`, `overflow-hidden`, `flex-wrap`, `shrink-0`, and `truncate` local to the composition that needs them.
- Do not use raw palette classes, arbitrary value classes, or inline visual styles in artifacts.
- Do not recreate root reading width, block hover highlighting, toolbar placement, sidebar chrome, or theme editor chrome in artifact source.
- Keep text, code, generated output, and data values selectable. Chrome, navigation rows, badges, and block action controls may disable accidental selection through primitives.

## Asset Rules

- Put imported images, media, and bundle-time files in `agent-html/assets` and import them with relative `../assets/...` paths.
- Put URL-addressed static files in `agent-html/public` and reference them as `/__agent-html/public/<path>`.
- Do not import from `../public`.

## Forbidden Imports And Actions

- Do not call Codex app-server, the filesystem, shell commands, MCP servers, or privileged host APIs from artifact code.
- Do not import `@/app/*`, `apps/agent-html-app`, `@/agent-html/runtime/ui`, `renderAgentHtml`, or `renderInteractiveAgentHtml`.
- Do not import Canvas host internals from artifact source.

## Source Routes

- Read `artifacts/README.md` before opening large artifact source.
- Use `components/README.md` for the component source route and `TASTE.md` for
  component choice before scanning the full primitive surface.
