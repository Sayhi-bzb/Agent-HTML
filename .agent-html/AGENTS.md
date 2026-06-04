# AgentHTML React Canvas

Write normal React artifacts in `.agent-html/artifacts/*.agent.tsx`.

## Design contract

React Canvas uses the same design-system direction as the app, but it does not
import the app implementation:

```text
.agent-html/styles/theme.css
  -> semantic token values

.agent-html/styles.css
  -> Tailwind, shadcn CSS, font imports, token bridge, and base styles

.agent-html/theme
  -> host-owned theme preset resources

.agent-html/ui
  -> local visual primitives

artifacts and host
  -> primitive composition and semantic layout
```

- `.agent-html/styles/theme.css` owns semantic values such as color, font,
  radius, chart, and sidebar tokens.
- `.agent-html/styles.css` is the runtime CSS bridge. It imports Tailwind,
  shadcn CSS, fonts, and theme values; it does not own component structure.
- `.agent-html/theme` owns Canvas theme preset resources. Host chrome may read
  presets from here and apply them to the token pipeline; artifacts should
  continue to consume semantic utilities and tokens instead of choosing preset
  values directly.
- `.agent-html/ui` is the only primitive layer for React Canvas. Keep local
  shadcn-derived primitives low-modification unless Canvas needs a primitive
  API, correctness fix, or accessibility fix.
- Available primitives include accordion, alert, badge, button, card, chart,
  checkbox, dialog, input, label, popover, scroll-area, select, separator,
  sheet, sidebar, skeleton, table, tabs, textarea, and tooltip.
- Host and artifacts compose primitives; they do not create new primitive
  buttons, cards, badges, tables, sidebars, or inputs.
- Host block hover highlighting is inspection chrome. It consumes Canvas tokens
  from `theme.css` through `styles.css`; do not recreate block highlighting in
  artifact source or on `Block`.
- `Artifact`, `Block`, and `Action` from `@agent-html/react` are headless
  collaboration protocol markers, not visual components. `Block` is fully
  protocol-only: use only `id`, `title`, and children. Do not put `className`,
  `style`, layout, border, radius, or shadow on `Block`. Put layout and visual
  treatment in artifact composition and `.agent-html/ui` primitives.
- Use semantic token utilities such as `bg-background`, `text-foreground`,
  `bg-card`, `text-muted-foreground`, `border-border`, `bg-popover`, and
  `text-popover-foreground`.
- Font and radius flow through explicit tokens: `--font-sans-source`,
  `--font-heading-source`, `--radius-base`, and the shadcn-compatible
  `--radius`.
- Do not use raw colors, decorative gradients, oversized shadows, or marketing
  hero composition.
- Use compact scale utilities for artifact structure. Prefer `gap-2`, `gap-3`,
  `gap-4`, `gap-6`, `p-2`, `p-3`, `p-4`, `p-6`, `text-sm`, `text-base`,
  `leading-snug`, `leading-normal`, `min-w-0`, `overflow-hidden`, and
  `truncate`.
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

Rules:

- Import `Artifact`, `Block`, and `Action` from `@agent-html/react`.
- Use `Artifact` as the top-level wrapper.
- Wrap every major semantic region in `Block`.
- Keep `Block` static and unstyled. Layout belongs inside the block, not on the
  block marker.
- Use stable, unique, readable, kebab-case block ids.
- Prefer local `../ui`, `../hooks`, `../lib`, `../schema`, and `../data`
  imports before hand-writing common UI or utility code.
- Do not call Codex app-server, the filesystem, shell commands, MCP servers, or
  privileged host APIs from artifact code.
- Do not import `@/app/*`, `apps/agent-html-app`, `@/agent-html/runtime/ui`,
  `renderAgentHtml`, or `renderInteractiveAgentHtml`.
- Do not use old AHTML `<Cell>` DSL for React Canvas artifacts.
