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

Only foundation tokens may contain raw reusable design values.
Semantic tokens MUST consume foundation tokens.
Layout constants are structural values and MUST NOT become a shadow token system.

## Foundation Scale

### Color

Use a neutral-first foundation.
The current shell implies the need for at least:

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

Required radius scale:

- `radius-sm`
- `radius-md`
- `radius-lg`
- `radius-xl`
- `radius-2xl`
- `radius-3xl`
- `radius-4xl`

### Spacing

Required spacing scale:

- `space-1`
- `space-1_5`
- `space-2`
- `space-2_5`
- `space-3`
- `space-4`
- `space-5`
- `space-6`

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

Detailed preview text-role usage is owned by [`../src/gallery/preview/rule/typography.md`](../src/gallery/preview/rule/typography.md).

### Icon Sizes

Required icon scale:

- `icon-sm`
- `icon-md`
- `icon-lg`

### Shadows

Required shadow scale:

- `shadow-none`
- `shadow-sm`
- `shadow-md`
- `shadow-lg`

The system SHOULD converge on borders first and light shadows second.

### Z-Index

Required layer scale:

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
When shell and workspace surfaces are intentionally unified, `sidebar*` SHOULD map to the
corresponding shared semantic tokens (`background`, `foreground`, `accent`, `border`, `ring`,
`primary`) rather than introducing a second independent palette.

In the current shell/gallery/workspace model:

- `background` owns the shell plane
- `card` owns the primary workspace plane
- `sidebar*` is a shell-facing alias layer over the shared semantic tokens above
- gallery-mode sidebar editor panels are still shell surfaces unless they intentionally escalate to
  a stronger local plane

The current implementation also uses shell-local semantic context without introducing a new global
token family:

- weakened secondary shell text is expressed as `sidebar-foreground` with lower opacity
- secondary shell hover strengthens text before it claims new background
- active sidebar identity is expressed through surface and foreground, not font-weight

## Layout Constants

The current shell includes structural constants that are not general-purpose design tokens:

- header height
- sidebar width
- mobile sidebar width
- collapsed icon-rail width

These values:

- MUST be centrally declared
- MUST be treated as shell constants
- MUST NOT justify local component constants elsewhere

## Token Consumption Order

Components MUST consume visual values in this order:

1. semantic token
2. sanctioned layout constant when the value is structural
3. local utility only when the value is compositional and not reusable

Components MUST NOT:

- inline raw colors
- invent local spacing scales
- invent local radius scales
- rely on arbitrary values when a system token exists

## Current Gaps

The current implementation still needs normalization in these areas:

- raw values still live directly inside semantic declarations
- spacing remains implicit in utility usage rather than formal top-level tokens
- icon and shadow scales are not yet fully expressed as explicit top-level sources
- shell-local tone contexts still live in primitive classes rather than in a more explicit semantic
  token interface
