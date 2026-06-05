# Design Tokens Specification

## Purpose

This document defines the token model for frontend UI.
It translates the constitution into concrete token layers, naming rules, and consumption order.

## Ownership

This document owns token taxonomy, token naming, semantic interfaces, and layout constants.
It does not define typography roles, page layouts, or component-family behavior beyond token use.

## Token Layers

The token system has three layers:

1. Foundation scale
2. Semantic tokens
3. Layout constants

The intended model is that foundation tokens contain raw reusable design values and semantic tokens
consume foundation tokens. The current implementation still keeps some raw values directly in
semantic variable declarations and generated presets.
Layout constants are structural values and MUST NOT become a shadow token system.

## Foundation Scale

### Color

Use a neutral-first foundation. The intended foundation needs at least:

- `color-neutral-0`
- `color-neutral-50`
- `color-neutral-200`
- `color-neutral-400`
- `color-neutral-800`
- `color-neutral-900`
- `color-neutral-950`
- `color-blue-600`
- `color-red-400`
- `color-red-600`

Foundation color names MUST be scale-based, not component-based.

### Radius

Intended radius scale:

- `radius-sm`
- `radius-md`
- `radius-lg`
- `radius-xl`
- `radius-2xl`
- `radius-3xl`
- `radius-4xl`

### Spacing

Intended spacing scale:

- `space-1`
- `space-1_5`
- `space-2`
- `space-2_5`
- `space-3`
- `space-4`
- `space-5`
- `space-6`

Current utility baselines may still express these roles directly while the token layer is being
normalized:

- `p-4` to `p-6` for page and section padding
- `p-5` for common card padding
- `gap-6` for section separation
- `gap-4` for local grid and card-group separation
- `gap-2` and `gap-3` for dense inline UI
- `gap-1` for sidebar item rhythm
- `h-8` for standard sidebar item height

### Typography-Related Foundation Values

Typography-specific scale values belong here as raw values only:

- `text-xs`
- `text-sm`
- `text-base`
- `text-2xl`
- `text-3xl`
- `font-weight-medium`
- `font-weight-semibold`
- `line-height-none`
- `line-height-tight`
- `line-height-normal`
- `line-height-relaxed`
- `tracking-tight`
- `tracking-normal`

Detailed preview text-role usage is owned by [`../apps/agent-html-app/src/gallery/preview/rule/typography.md`](../apps/agent-html-app/src/gallery/preview/rule/typography.md).

### Icon Sizes

Intended icon scale:

- `icon-sm`
- `icon-md`
- `icon-lg`

### Shadows

Intended shadow scale:

- `shadow-none`
- `shadow-sm`
- `shadow-md`
- `shadow-lg`

The system SHOULD converge on borders first and light shadows second.

### Z-Index

Intended layer scale:

- base content
- sticky chrome
- dropdown / tooltip / popover
- modal / sheet overlay

## Semantic Tokens

The current semantic interface includes at least:

- `background`
- `foreground`
- `card`
- `card-foreground`
- `popover`
- `popover-foreground`
- `primary`
- `primary-foreground`
- `secondary`
- `secondary-foreground`
- `muted`
- `muted-foreground`
- `accent`
- `accent-foreground`
- `destructive`
- `border`
- `input`
- `ring`
- `sidebar`
- `sidebar-foreground`
- `sidebar-primary`
- `sidebar-primary-foreground`
- `sidebar-accent`
- `sidebar-accent-foreground`
- `sidebar-border`
- `sidebar-ring`

Rules:

- semantic names MUST express role, not appearance
- light and dark MUST expose the same semantic names
- component code MUST consume semantic tokens rather than foundation tokens directly

`sidebar*` remains a valid semantic interface for shell-specific consumption.
It does not imply a permanently separate color family.
The current app has both default `sidebar*` mappings and app-level remaps that align the shell with
shared semantic tokens in specific modes. Further normalization should avoid growing `sidebar*` into
a second independent palette.

Floating surfaces consume `popover` / `popover-foreground`.
Interactive states inside floating surfaces consume `accent` / `accent-foreground`.
Primitive selection and component-family rules are owned by [`components.md`](./components.md).

## Layout Constants

The current shell includes structural constants that are not general-purpose design tokens:

- header height
- sidebar width
- mobile sidebar width
- collapsed icon-rail width
- standard control height
- standard sidebar item height

These values:

- MUST be centrally declared
- MUST be treated as shell constants
- MUST NOT justify local component constants elsewhere

## Token Consumption Order

New or substantially touched components SHOULD consume visual values in this order:

1. semantic token
2. sanctioned layout constant when the value is structural
3. local utility only when the value is compositional and not reusable

New or substantially touched components MUST NOT:

- inline raw colors
- invent local spacing scales
- invent local radius scales
- rely on arbitrary values when a system token exists

## Current Gaps

The current implementation still needs normalization in these areas:

- raw values still live directly inside semantic declarations and generated presets
- spacing remains implicit in utility usage rather than formal top-level tokens
- icon and shadow scales are not yet fully expressed as explicit top-level sources
- shell-local tone contexts still live in primitive classes rather than in a more explicit semantic
  token interface
