# React Canvas Token Pipeline Simplification Blueprint

## Background

The current Canvas style pipeline has already moved toward an agent-readable
shape:

- `.agent-html/styles/content.css` is the ordinary artifact-facing style API.
- `.agent-html/styles/internal` owns locked host, artifact, and theme editor
  chrome.
- `.agent-html/styles/tokens` owns values and Tailwind/shadcn mapping.

The next risk is not missing tokens. The risk is fake separation: aliases,
editor controls, and token layers that look semantic but do not represent an
actual ownership boundary or independent behavior.

This blueprint keeps the style system aligned with context ergonomics: agents
should see the smallest correct style world for the current task, and internal
compatibility details should not appear as editable product surface.

## Principles

- Keep one source of truth for each editable style decision.
- Preserve shadcn-compatible tokens when the runtime needs them.
- Do not expose compatibility aliases as agent-facing design controls.
- Remove aliases that only rename another token without adding ownership.
- Prefer stable visual behavior over broad redesign.
- Do not modify shadcn/ui primitives for this cleanup.
- Keep `Artifact`, `Block`, and `Action` as protocol/headless markers.

## Priority 1: Collapse Font Pipeline

Current issue:

- Font tokens have a source/runtime split:
  - `--font-sans-source`
  - `--font-heading-source`
  - `--font-sans`
  - `--font-heading`
  - `--font-mono`
- The split creates duplicate editor concepts even though the system has one
  practical font decision per role.

Direction:

- Keep explicit role tokens:
  - `--font-sans`
  - `--font-heading`
  - `--font-mono`
- Remove the `*-source` layer unless a future font loader needs a real source
  boundary.
- Map Tailwind directly from the role tokens.
- Theme editor should expose only the role tokens.

Acceptance:

- Agents can identify the font pipeline without reading two naming layers.
- Theme editing does not show duplicate font fields for the same decision.
- Visual output remains unchanged unless a preset explicitly changes fonts.

## Priority 2: Clean Theme Editor Surface

Current issue:

- Some tokens exist for shadcn compatibility, especially sidebar aliases.
- These aliases are useful to runtime mapping but should not become separate
  editable product decisions by default.

Direction:

- Keep shadcn-required aliases such as sidebar color tokens when components
  consume them.
- Treat those aliases as internal mapping unless they represent a deliberate
  independent theme axis.
- Do not expose sidebar color aliases as separate editor fields while they
  mirror base tokens like `--background`, `--foreground`, `--primary`,
  `--accent`, `--border`, and `--ring`.
- Keep theme presets focused on the canonical color/radius/font/spacing
  decisions.

Acceptance:

- Changing a theme produces consistent sidebar and main colors.
- The editor presents fewer but more meaningful controls.
- Compatibility aliases do not pollute the agent-facing theme surface.

## Priority 3: Decide Shadow Pipeline

Current issue:

- The foundation token file contains shadow source-like knobs:
  - `--shadow-color`
  - `--shadow-opacity`
  - `--shadow-x`
  - `--shadow-y`
  - `--shadow-blur`
  - `--shadow-spread`
- It also contains static shadow scale tokens:
  - `--shadow-sm`
  - `--shadow`
  - `--shadow-md`
  - and larger variants.
- If the static scale is not derived from the source knobs, the editor implies
  a pipeline that does not actually exist.

Direction:

- Choose one shadow model before implementation:
  - derived model: source knobs generate the scale; or
  - static model: keep shadcn-style shadow scale and remove source knobs from
    the editable surface.
- Prefer the static model unless there is a concrete product need for custom
  generated shadow scales.

Acceptance:

- Shadow controls match the real CSS behavior.
- There is no editor field that appears to control shadows but only partially
  affects the final scale.
- Agents do not need to inspect implementation internals to understand shadow
  editing.

## Priority 4: Consolidate Host/Sidebar Micro Tokens

Current issue:

- Some host tokens are one-use micro decisions, for example sidebar select
  padding or block action shadow.
- These tokens increase the number of names an agent must evaluate without
  creating meaningful reuse or independent density control.

Direction:

- Keep host tokens that represent reusable layout, density, or interaction
  boundaries.
- Inline or merge one-use values when they only describe a local component
  detail.
- Reuse existing host spacing or base tokens before adding new micro tokens.
- Keep block hover styling locked at host level.

Acceptance:

- Host token files describe meaningful host-level decisions.
- Local one-off component details do not appear as global design parameters.
- Block hover and artifact content boundaries stay clear.

## Non-Goals

- Do not redesign Canvas visuals.
- Do not change shadcn/ui primitive source files.
- Do not reintroduce style props on `Artifact`, `Block`, or `Action`.
- Do not remove shadcn compatibility tokens that are required by existing
  components.
- Do not split files more finely unless it improves the agent route.

## Implementation Order

1. Collapse font tokens and update Tailwind/theme editor references.
2. Hide compatibility-only aliases from the theme editor surface.
3. Resolve shadow model and update tokens/editor/tests accordingly.
4. Consolidate host/sidebar one-use micro tokens.

Each step should be implemented as a narrow change with visual parity checks
where possible.

## Verification

Run these checks after implementation:

- `npm run react-canvas:typecheck`
- `npm run react-canvas:guard`
- targeted host/theme/token tests
- `gitnexus_detect_changes({ scope: "all" })`

Expected result: affected scope is limited to Canvas style tokens, host/theme
editor mapping, and related tests.
