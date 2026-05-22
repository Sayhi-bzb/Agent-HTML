# Typography Rules

## Purpose

This document defines the typography standard for gallery preview component adaptation work.
It turns the current preview page style into a reusable role system for future gallery preview
surfaces.

## Ownership

This document owns typeface choice, text roles, line-height, weight, tracking, and text color use
for preview-facing component adaptation.
It does not define raw token names or page layout structure.

## Preview Boundary

This rule applies to `src/gallery/preview/*` only.

- preview cards MUST consume `src/gallery/preview/ui/*`
- preview primitives MAY consume `src/gallery/preview/styles/*`
- preview typography rules MUST NOT leak into `src/components/ui/*`
- gallery editor / panel / shell code MUST continue to consume `src/components/ui/*`

## Typeface

The default preview UI typeface is `Geist Variable`.

Rules:

- all preview interface text MUST use `Geist Variable`
- fallback fonts MAY remain generic sans-serif fallbacks
- alternate display fonts MUST NOT be introduced inside preview UI

## Typography Principles

Typography in preview should remain:

- compact
- technical
- quiet
- semibold at key hierarchy points
- low in ornament

Hierarchy should come from role clarity, not from dramatic display styling.

## Text Roles

### Page Title

Use for the primary heading of a preview page or preview panel.

- size: `text-2xl`
- weight: `font-semibold`
- tracking: `tracking-tight`
- line height: tight

### KPI / Metric Value

Use for high-emphasis numeric or summary values.

- size: `text-3xl`
- weight: `font-semibold`
- tracking: `tracking-tight`
- line height: tight

### Section Title

Use for module headings and card section headers.

- size: `text-sm`
- weight: `font-medium` or `font-semibold`
- tracking: normal

### Body Text

Use for standard explanation and descriptive copy.

- size: `text-sm`
- weight: normal
- line height: relaxed, typically `leading-6`

### Supporting Text

Use for metadata, timestamps, breadcrumbs, sublabels, and secondary context.

- size: `text-xs` or `text-sm`
- weight: normal
- color: `muted-foreground`

### Dense Control Text

Use inside compact controls, buttons, nav items, and dropdown items.

- size: `text-sm`
- weight: default or medium depending on control role
- line height: compact

Current preview rule:

- preview controls SHOULD NOT rely on heavier active weight by default
- emphasis SHOULD usually come from foreground and surface change first

### Label Text

Use for explicit form and UI labels.

- size: `text-sm`
- weight: `font-medium`
- line height: controlled

## Line Height Rules

Line height MUST follow text role.

- dense controls SHOULD use compact line height
- page titles and metric values SHOULD use tight line height
- body text SHOULD use relaxed line height
- supporting metadata SHOULD avoid overly loose line height

Use guidance:

- `leading-none` for tightly controlled control labels only
- `leading-tight` for strong headings and compact title blocks
- `leading-6` for readable explanatory copy

## Tracking Rules

Tracking is minimal.

- `tracking-tight` SHOULD be used on page titles and metric values
- default tracking SHOULD be used for body and control text
- decorative wide tracking MUST NOT become a standard pattern

## Weight Rules

Weight is the primary hierarchy lever.

- `font-semibold` for page titles and major values
- `font-medium` for labels, controls, and section headings
- default weight for body and supporting copy

Active preview controls SHOULD NOT automatically become heavier when selected.
If a preview control needs emphasis, prefer foreground, background, or positional hierarchy before
adding weight.

## Color Rules

Typography color MUST come from semantic tokens.

- primary text uses `foreground`
- supporting text uses `muted-foreground`
- destructive text uses `destructive`

## Reuse Rule

A new preview card should not need to redefine:

- what a page title looks like
- what a card title looks like
- what helper text looks like
- what a timestamp looks like
- what compact control text looks like

## Rule Check Script

This rule is accompanied by a governance helper script:

- `rule/typography/check-typography.mjs`

Usage:

```bash
node rule/typography/check-typography.mjs
```

Current scan scope:

- `src/gallery/preview/ui/*`
- `src/gallery/preview/cards/*`

The script reports direct preview typography utility usage that has not yet been migrated to
preview token or role consumption.
