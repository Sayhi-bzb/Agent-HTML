# AgentHTML React Canvas

Write normal React artifacts in `.agent-html/artifacts/*.agent.tsx`.

## Design contract

React Canvas uses the same design-system direction as the app, but it does not
import the app implementation:

```text
.agent-html/AGENTS.md
  -> workspace rules and operating instructions

.agent-html/components.json
  -> shadcn workspace discovery config

.agent-html/tsconfig.json
  -> local TypeScript and editor discovery config

.agent-html/styles/index.css
  -> Tailwind, shadcn CSS, font imports, and CSS pipeline imports

.agent-html/styles/tokens
  -> semantic token values split by feature

.agent-html/styles/content.css
  -> artifact-consumable Canvas semantic classes

.agent-html/styles/internal
  -> locked Canvas system chrome and protocol-adjacent styles

.agent-html/theme
  -> host-owned theme preset resources

.agent-html/ui
  -> local visual primitives

.agent-html/hooks
  -> reusable React behavior

.agent-html/lib
  -> pure helpers and transforms

.agent-html/schema
  -> typed contracts and validation

.agent-html/data
  -> fixtures and local datasets

.agent-html/assets
  -> bundle-time artifact assets imported by artifact source

.agent-html/public
  -> static files served by URL at /__agent-html/public/<path>

artifacts and host
  -> primitive composition and semantic layout
```

- `.agent-html/AGENTS.md`, `.agent-html/components.json`, and
  `.agent-html/tsconfig.json` stay at the workspace root because agents,
  shadcn, TypeScript, and editors discover them from there.
- `.agent-html/styles/index.css` is the CSS runtime entrypoint discovered by
  shadcn and the dev host. It imports Tailwind, shadcn CSS, fonts, token files,
  Tailwind token mappings, base styles, public content classes, and locked
  internal classes.
- `.agent-html/styles/tokens` owns semantic values. Read
  `tokens/foundation.css` for base color, font, radius, chart, and sidebar
  values; read `tokens/content.css`, `tokens/artifact.css`,
  `tokens/host.css`, or `tokens/theme-editor.css` for feature values.
- `.agent-html/styles/tokens/tailwind.css` maps semantic values into Tailwind
  tokens.
- `.agent-html/styles/content.css` owns the public artifact style API. Read it
  when artifact content needs reusable spacing, surface, icon-box, or text
  scale classes.
- `.agent-html/styles/internal` owns locked Canvas system styles. Read
  `artifact.css`, `host.css`, or `theme-editor.css` only when editing the
  Artifact reading container, host chrome, block hover/action chrome, sidebar,
  toolbar, or theme editor.
- `.agent-html/theme` owns Canvas theme preset resources. Host chrome may read
  presets from here and apply them to the token pipeline; artifacts should
  continue to consume semantic utilities and tokens instead of choosing preset
  values directly.
- `.agent-html/ui` is the only primitive layer for React Canvas. Keep local
  shadcn-derived primitives low-modification unless Canvas needs a primitive
  API, correctness fix, or accessibility fix.
- Available primitives include accordion, alert, badge, button, card, chart,
  checkbox, collapsible, dialog, hover-card, input, label, popover, progress,
  scroll-area, select, separator, sheet, sidebar, skeleton, slider, table, tabs,
  textarea, toggle, toggle-group, and tooltip.
- Host and artifacts compose primitives; they do not create new primitive
  buttons, cards, badges, tables, sidebars, or inputs.
- Host block hover highlighting is inspection chrome. It consumes Canvas tokens
  from `styles/tokens/host.css` through `styles/internal/host.css`; do
  not recreate block highlighting in artifact source or on `Block`.
- `Artifact`, `Block`, and `Action` from `@agent-html/react` are headless
  collaboration protocol markers, not visual components. `Artifact` owns the
  readable root container and accepts only `title` and children. Its width,
  block gap, background, and foreground values come from
  `styles/tokens/artifact.css` through `styles/internal/artifact.css`.
  Do not put `className`, `style`, width, spacing, padding, or color props on
  `Artifact`.
  `Block` is fully protocol-only: use only `id`, `title`, and children. Do not
  put `className`, `style`, layout, border, radius, or shadow on `Block`. Put
  block content layout and visual treatment inside the block and
  `.agent-html/ui` primitives.
- Use semantic token utilities such as `bg-background`, `text-foreground`,
  `bg-card`, `text-muted-foreground`, `border-border`, `bg-popover`, and
  `text-popover-foreground`.
- Font and radius flow through explicit tokens: `--font-sans-source`,
  `--font-heading-source`, and the shadcn-compatible `--radius`.
- Do not use raw colors, decorative gradients, oversized shadows, or marketing
  hero composition.
- Use Canvas semantic classes for artifact structure and host chrome. Content
  spacing, panel padding, panel radius, icon-box size, typography scale, grid
  gap, surface padding, toolbar offset, block action offset, status spacing,
  sidebar spacing, and prompt output height come from explicit `--canvas-*`
  tokens in `.agent-html/styles/tokens/*`, public artifact classes in
  `.agent-html/styles/content.css`, and locked system classes in
  `.agent-html/styles/internal/*`.
- Keep layout behavior classes such as `flex`, `grid`, `min-w-0`,
  `overflow-hidden`, `flex-wrap`, `shrink-0`, and `truncate` local to the
  composition that needs them.
- Do not use arbitrary values, oversized typography, custom fonts, manual
  tracking, oversized radius, or heavy shadows in artifacts.
- Keep surfaces compact, neutral, task-oriented, accessible, and predictable.
- Use cards only for real modules, objects, list items, placeholders, or
  disclosures. Avoid card-inside-card unless the inner surface has independent
  object identity or interaction scope.
- Treat the sidebar as a first-class component family. Use sidebar primitives
  and `sidebar*` tokens for sidebar chrome only.
- Treat prompt UI as a disclosure surface. Floating panels use `popover` tokens,
  not sidebar tokens.
- Text, code, generated output, and data values should stay selectable. Chrome,
  navigation rows, badges, and block action controls may disable accidental
  selection through primitives.
- Put imported images, media, and bundle-time files in `.agent-html/assets` and
  import them with relative `../assets/...` paths.
- Put URL-addressed static files in `.agent-html/public` and reference them as
  `/__agent-html/public/<path>`. Do not import from `../public`.

Rules:

- Import `Artifact`, `Block`, and `Action` from `@agent-html/react`.
- Use `Artifact` as the top-level wrapper.
- Keep `Artifact` static and unstyled. The root reading width, spacing, and
  base colors are configured by `--canvas-artifact-*` tokens in
  `.agent-html/styles/tokens/artifact.css`.
- Wrap every major semantic region in `Block`.
- Keep `Block` static and unstyled. Layout belongs inside the block, not on the
  block marker.
- Use stable, unique, readable, kebab-case block ids.
- Prefer local `../ui`, `../hooks`, `../lib`, `../schema`, `../data`, and
  `../assets` imports before hand-writing common UI or utility code.
- Do not call Codex app-server, the filesystem, shell commands, MCP servers, or
  privileged host APIs from artifact code.
- Do not import `@/app/*`, `apps/agent-html-app`, `@/agent-html/runtime/ui`,
  `renderAgentHtml`, or `renderInteractiveAgentHtml`.
- Do not use old AHTML `<Cell>` DSL for React Canvas artifacts.
