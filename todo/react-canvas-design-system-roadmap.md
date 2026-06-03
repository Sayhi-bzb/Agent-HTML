# React Canvas Design-System Roadmap

## Goal

Bring `.agent-html` and the React Canvas host under the same design-system discipline defined by
`design/constitution.md`, `design/tokens.md`, `design/components.md`, `design/layout.md`, and
`design/code-structure.md`.

The next round should not copy the app shell implementation. It should copy the app's consumption
model:

```text
tokens
  -> .agent-html/ui primitives
  -> host composites
  -> host app composition
```

## Current Read

- `.agent-html` already has the right source-kit folders: `ui`, `hooks`, `lib`, `schema`, `data`,
  `examples`, and `artifacts`.
- Host UI already imports `.agent-html/ui` through `@/ui/*`.
- Host server and host client are already split by concern.
- The next risk is not runtime behavior. The next risk is letting `.agent-html` and host grow a
  second undocumented design system through local utility bundles, ad hoc panels, or copied shell
  markup.

## Non-Negotiable Architecture Constraints

### 1. Layer Direction

React Canvas must use the same downward dependency rule as the app design constitution:

```text
.agent-html/styles.css
  -> .agent-html/ui/*
  -> packages/cli/src/host/*
  -> .agent-html/artifacts/*
```

Rules:

- `.agent-html/ui/*` owns primitives, variants, slots, and shadcn-derived interaction behavior.
- `packages/cli/src/host/*` owns host composites and page composition only.
- `.agent-html/artifacts/*` owns artifact content and local data presentation only.
- `packages/react` stays limited to `Artifact`, `Block`, and `Action` collaboration markers.
- Host must not import `apps/agent-html-app/src/*`, `@/app/*`, old AHTML runtime UI, or old AHTML
  render APIs.
- Artifacts must prefer `.agent-html/ui`, `.agent-html/hooks`, `.agent-html/lib`, `.agent-html/schema`,
  and `.agent-html/data` before adding local helpers.

### 2. Token Source

`.agent-html/styles.css` is the token and theme-mapping entrypoint for React Canvas.

Rules:

- Components consume semantic tokens such as `background`, `foreground`, `card`, `popover`, `muted`,
  `accent`, `border`, `ring`, and `sidebar*`.
- Host and artifacts must not inline raw colors when a semantic token exists.
- `sidebar*` is allowed for sidebar chrome, not for popovers or artifact content.
- Floating panels consume `popover` / `popover-foreground`; floating item states consume
  `accent` / `accent-foreground`.
- Structural values such as sidebar width and host panel width should live in the owning primitive
  or host composite, not scattered across artifacts.

### 3. Primitive Ownership

`.agent-html/ui/*` is the only primitive layer for React Canvas.

Rules:

- Do not hand-write alternate buttons, inputs, cards, badges, sheets, tooltips, tables, or sidebars
  in host or artifacts.
- If repeated host or artifact styling appears twice, first check whether it belongs in a
  `.agent-html/ui` primitive variant.
- Add primitive variants before adding repeated local utility bundles.
- Primitive edits require checking artifact and host consumers because the blast radius is global.

### 4. Host Composition

The host should behave like a small operating shell without importing the app shell.

Required host regions:

- Sidebar: artifact navigation, guard issue counts, host-level actions.
- Content well: rendered artifact surface, guard/error/empty states, block overlay layer.
- Prompt disclosure: block-aware prompt request and generated prompt output.

Rules:

- The sidebar must use `.agent-html/ui/sidebar` primitives: `Sidebar`, `SidebarHeader`,
  `SidebarContent`, `SidebarFooter`, `SidebarMenu`, `SidebarMenuItem`, and `SidebarMenuButton`.
- Sidebar labels must truncate inside a `min-w-0` region; trailing badges must stay `shrink-0`.
- Host-level state rows should be compact and scan-first; do not add large explanatory cards for
  normal loading or empty states.
- Prompt UI should be treated as a disclosure surface. Use `Popover`, `Sheet`, or `Dialog` semantics
  when the corresponding `.agent-html/ui` primitive exists; until then, keep the current fixed panel
  minimal and token-backed.
- Guard issue display should become a host composite or primitive-backed status surface, not a local
  ad hoc bordered block repeated elsewhere.

### 5. Artifact Composition

Artifacts are content surfaces, not design-system authors.

Rules:

- Artifact layout should use compact panels, tables, charts, and lists built from `.agent-html/ui`.
- Major semantic regions must be wrapped in `Block`.
- Artifact-level cards should represent real modules, objects, lists, placeholders, or disclosures.
- Avoid card-inside-card unless the inner surface has independent object identity or interaction
  scope.
- Avoid hero sections, decorative gradients, oversized whitespace, and marketing-page composition.
- Artifact text, code, generated output, and data values should remain selectable.
- Navigation-like controls, action icons, badges, and block overlay chrome should disable accidental
  selection when the primitive supports it.

## Roadmap

### Phase 1: Document the Local Design Contract

- Add a React Canvas design contract under `.agent-html`, or extend `.agent-html/AGENTS.md`, so
  agents get an implicit local rule source before writing artifacts.
- The contract should mirror the app design layers without referencing app implementation imports.
- It should define `.agent-html/styles.css` as token source, `.agent-html/ui` as primitive source,
  and host/artifacts as composition layers.
- It should explicitly forbid importing `@/app/*`, old AHTML runtime UI, and hand-written duplicate
  primitives.

Acceptance:

- A future agent can read `.agent-html/AGENTS.md` and know which local folders to consume.
- The rules distinguish app philosophy from app implementation.

### Phase 2: Normalize Host Surfaces

- Audit `packages/cli/src/host/*` against `design/components.md` and `design/layout.md`.
- Promote repeated host state UI into small host composites only when it is host-specific.
- Move primitive-looking repeated UI concerns into `.agent-html/ui` variants instead.
- Replace ad hoc state blocks with token-backed compact status rows or primitive-backed panels.
- Keep host composition limited to sidebar, artifact surface, block overlay, prompt disclosure, and
  API wiring.

Acceptance:

- Host imports only `.agent-html/ui`, host-local modules, and CLI prompt/API helpers.
- Host has no copied app shell imports or old runtime imports.
- Host status, prompt, and sidebar surfaces consume semantic tokens.

### Phase 3: Strengthen `.agent-html/ui` as the Furniture Layer

- Review every `.agent-html/ui/*` primitive for shadcn lineage, token usage, accessibility states,
  and slot naming.
- Ensure sidebar primitives support the host and artifact navigation cases without local sidebar
  reimplementation.
- Add missing primitives only when the host or artifacts need the interaction semantics, not just
  a visual shape.
- Prefer `Popover`, `Dialog`, `Sheet`, `DropdownMenu`, `Select`, and `CommandDialog` semantics based
  on interaction need once those primitives are installed.

Acceptance:

- Host and artifacts do not duplicate button/input/sidebar/card behavior.
- New primitives are justified by repeated interaction semantics.

### Phase 4: Add Guardrails

- Add tests or static checks for forbidden host imports:
  `@/app/*`, `apps/agent-html-app`, old `@/agent-html/runtime/ui`, old render APIs, and old host
  route names.
- Add a source scan for local raw color usage in host and artifacts.
- Add a source scan for artifact imports that bypass `.agent-html/ui` for common primitives.
- Keep existing CLI behavior stable: `agent-html dev`, `agent-html guard`, artifact scan, bundle,
  guard issues, block overlays, and prompt packaging.

Acceptance:

- `npm run react-canvas:typecheck`, `npm run react-canvas:guard`, and focused host tests prove the
  boundaries.
- Static search only finds forbidden strings in tests that assert absence.

### Phase 5: Normalize Example Artifacts

- Treat `.agent-html/artifacts/example.agent.tsx` and `.agent-html/examples/*` as sample rooms.
- Rewrite examples to demonstrate the design contract:
  compact density, token-backed surfaces, primitive-first composition, block wrapping, and local
  data/hooks/lib usage.
- Avoid examples that teach agents to hand-write CSS bundles, raw colors, or one-off controls.

Acceptance:

- Examples are usable as agent references without creating a shadow design system.
- Every example imports common UI from `.agent-html/ui` and common helpers from `.agent-html/lib`,
  `.agent-html/hooks`, `.agent-html/schema`, or `.agent-html/data`.

## Review Checklist

Use this before accepting the next implementation round:

- Does the change preserve the downward dependency model?
- Did any host or artifact file create a second primitive?
- Did any component bypass semantic tokens with raw colors?
- Did repeated local utility classes indicate a missing primitive variant or host composite?
- Does sidebar UI use sidebar primitives and `sidebar*` tokens?
- Does popover/dialog/sheet-like UI consume floating-surface tokens rather than sidebar tokens?
- Are block overlay and prompt interactions still operable by agents through stable file path,
  block id, selected source, and request payload?
- Are app philosophy and app implementation kept separate?

## Explicit Non-Goals

- Do not import the app shell into React Canvas host.
- Do not revive old AHTML DSL runtime as a React Canvas dependency.
- Do not build pattern templates yet.
- Do not add a broad design-system rewrite outside `.agent-html` and React Canvas host.
- Do not change CLI command names or the V1 artifact preview behavior.
