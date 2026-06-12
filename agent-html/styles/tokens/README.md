# Style Tokens

This directory owns Canvas CSS token values and token mappings.

Use this route after `../README.md` when the task asks for color, type, radius, density, reading width, host chrome, or theme editor tokens.

## Ownership

- `foundation.css`: global L1 primitives.
- `features/content.css`: artifact-consumable content tokens.
- `features/code-block.css`: CodeBlock implementation tokens.
- `features/artifact.css`: artifact reading container dimensions.
- `features/host.css`: host, sidebar, prompt, toolbar, and block chrome tokens.
- `features/theme-editor.css`: theme editor controls.
- `tailwind.css`: Tailwind and shadcn utility mapping only.
- `index.css`: token import map only.

## Boundary

Do not change `tailwind.css` to tune a single artifact. Tune the owning token file first, then let the mapping consume it.

Canvas-owned semantic tokens use the `--canvas-*` namespace. Unprefixed tokens
are shadcn-compatible theme primitives. `sidebar` tokens are host chrome tokens
only; artifact content must use public content classes or theme primitives such
as `background`, `card`, and `muted`. `ring` is reserved for focus, outline, and
host highlight affordances, not body text emphasis.

## Tailwind Mapping

`tailwind.css` is a Tailwind and shadcn mapping layer only. It may map owner
tokens with `var(...)`, and it may derive the approved Tailwind radius scale
from `--radius` with `calc(var(--radius) * n)`.

Do not put raw colors, raw lengths, feature-owned values, chart tuning values,
host tuning values, or artifact-specific values in `tailwind.css`. Add or tune
the value in the owning token file first, then expose the mapping here only when
Tailwind utilities need it.

## Foundation Scope

`foundation.css` owns:

- theme primitives: background, foreground, card, popover, primary, secondary,
  muted, accent, destructive
- global status primitives: success, warning, info
- chart primitives: chart 1 through 5
- global shape, spacing, type, and depth primitives
- shadcn compatibility aliases: sidebar primitives
- Canvas base affordances such as text selection

Do not add feature-scoped values, host-only scale, content-scale values, or
component-internal offsets to `foundation.css`.

## Feature Token Admission

Keep feature tokens for values that define a reusable scale, semantic role, or
theme-adjustable surface. Inline local implementation constants in
`styles/internal/*` when a value only sizes one skeleton part, one icon, one
status line, or one component-internal offset.

Host tokens should describe host chrome scale, not every host CSS number.

## Host Token Subdomains

`features/host.css` owns stable host chrome scale. Use these subdomains:

- `--canvas-surface-*`: preview and workbench surface spacing and frame placement.
- `--canvas-toolbar-*`: global toolbar placement and layer.
- `--canvas-sidebar-*`: persistent sidebar density, text scale, local gaps, and content padding.
- `--canvas-host-item-*`: reusable item row internals shared by select, menu, command, and sidebar rows.
- `--canvas-host-swatch-*`: reusable host swatch sizes.
- `--canvas-host-select-*`: reusable host select popover constraints.
- `--canvas-floating-prompt-*`: floating prompt surface placement and layer.
- `--canvas-block-highlight-*`: block overlay hover and highlight treatment.
- `--canvas-block-action-*`: block action badge placement and sizing.
- `--canvas-block-message-*`: block message popover and panel constraints.
- `--canvas-create-artifact-*`: empty-state create artifact composer constraints.

Do not use `--canvas-host-*` as a generic catch-all. Theme editor may reuse
sidebar density and text scale tokens when it inherits sidebar chrome;
theme-editor-specific dimensions stay in `features/theme-editor.css`.
`--canvas-create-artifact-*` belongs to the host empty-state composer, not
artifact source or `features/artifact.css`.
