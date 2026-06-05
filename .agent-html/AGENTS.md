# AgentHTML React Canvas

Write normal React artifacts in `.agent-html/artifacts/*.agent.tsx`. For cold start, read `.agent-html/README.md` first, then this file.

## Workspace Rules

- Keep `.agent-html` as a portable source workspace.
- Do not add `node_modules`, lockfiles, generated bundles, `.vite`, `dist`, `build`, or vendored dependency folders inside `.agent-html`.
- Keep `.agent-html/AGENTS.md`, `.agent-html/components.json`, and `.agent-html/tsconfig.json` at the workspace root for agent, shadcn, TypeScript, and editor discovery.
- Use `.agent-html/index` as a generated decision layer. Do not treat temporary declaration or dependency graph output as committed agent context.
- Use `.agent-html/package.json` only as source dependency metadata. New third-party dependencies need an explicit source or host owner.

## Documentation Maintenance

- Keep `README.md` as a conditional reading route, not a rulebook.
- Keep `AGENTS.md` as hard executable rules, not a design essay.
- Keep `index/*` as generated decision summaries, not full tool output.
- Keep `examples/*` as copyable patterns, not broad policy documents.
- Keep `styles/README.md` as the style route.
- Do not add a new `.agent-html` doc unless it owns a distinct question.
- Do not duplicate rules across README, AGENTS, index, examples, and styles docs. Link to the owning file instead.
- Do not commit full generated graphs, declaration rollups, or tool dumps as agent context.
- Do not manually hard-wrap prose. Use line breaks for Markdown structure, lists, tables, code blocks, and semantic separation only.
- Use short, imperative, operational wording.

## Directory Ownership

- Put artifact source in `artifacts`.
- Put copyable patterns in `examples`.
- Put visual primitives in `ui`.
- Put reusable React behavior in `hooks`.
- Put pure helpers and transforms in `lib`.
- Put typed contracts and validation in `schema`.
- Put Canvas CSS, tokens, and style routes in `styles`.
- Put theme preset resources in `theme`.
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
- Keep compact artifacts single-file. Split broad artifacts into `name.agent.tsx` as the overview and `name/*.block.tsx` as semantic block files.
- Keep `Block` protocol-only. Use only `id`, `title`, and children.
- Do not put `className`, `style`, layout, border, radius, shadow, spacing, width, padding, or color props on `Artifact` or `Block`.
- Put layout and visual treatment inside the block content and local `.agent-html/ui` primitives.
- Do not render host block prompt actions or block hover chrome from artifact source.
- Do not use old AHTML `<Cell>` DSL for React Canvas artifacts.

## Primitive Rules

- Prefer local `.agent-html/ui`, `hooks`, `lib`, `schema`, `data`, and `assets` imports before hand-writing common UI or utility code.
- Check `index/api-surface.md` before adding, duplicating, or changing a local primitive.
- Host and artifacts compose primitives. They do not create duplicate primitive buttons, cards, badges, tables, sidebars, inputs, or disclosure controls.
- Keep local shadcn-derived primitives low-modification unless Canvas needs a primitive API, correctness fix, or accessibility fix.
- Treat the sidebar as a component family. Use sidebar primitives and sidebar tokens for sidebar chrome only.
- Treat prompt UI as a disclosure surface. Floating panels use popover tokens, not sidebar tokens.

## Style Rules

- Read `styles/README.md` before touching Canvas classes, tokens, or internal chrome.
- Use `styles/content.css` classes for ordinary artifact content styling.
- Use semantic token utilities such as `bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border-border`, `bg-popover`, and `text-popover-foreground`.
- Keep layout behavior classes such as `flex`, `grid`, `min-w-0`, `overflow-hidden`, `flex-wrap`, `shrink-0`, and `truncate` local to the composition that needs them.
- Do not use raw colors, decorative gradients, arbitrary values, custom fonts, manual tracking, oversized typography, oversized radius, or heavy shadows in artifacts.
- Do not recreate root reading width, block hover highlighting, toolbar placement, sidebar chrome, or theme editor chrome in artifact source.
- Keep surfaces compact, neutral, task-oriented, accessible, and predictable.
- Use cards only for real modules, objects, list items, placeholders, or disclosures. Avoid card-inside-card unless the inner surface has independent object identity or interaction scope.
- Keep text, code, generated output, and data values selectable. Chrome, navigation rows, badges, and block action controls may disable accidental selection through primitives.

## Asset Rules

- Put imported images, media, and bundle-time files in `.agent-html/assets` and import them with relative `../assets/...` paths.
- Put URL-addressed static files in `.agent-html/public` and reference them as `/__agent-html/public/<path>`.
- Do not import from `../public`.

## Forbidden Imports And Actions

- Do not call Codex app-server, the filesystem, shell commands, MCP servers, or privileged host APIs from artifact code.
- Do not import `@/app/*`, `apps/agent-html-app`, `@/agent-html/runtime/ui`, `renderAgentHtml`, or `renderInteractiveAgentHtml`.
- Do not import Canvas host internals from artifact source.

## Examples

- Imitate `examples/example.agent.tsx` for split artifact structure.
- Treat `artifacts/interaction-state.agent.tsx` as a compact interaction example.
- Use `docs/ui/README.md` for component choice before scanning the full primitive surface.
