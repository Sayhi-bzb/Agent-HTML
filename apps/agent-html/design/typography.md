# Typography Specification

## Purpose

This document defines the typography standard for the workspace shell.
It turns the current page style into a reusable role system for future screens.

## Ownership

This document owns typeface choice, text roles, line-height, weight, tracking, and text color use.
It does not define raw token names or page layout structure.

## Typeface

The default UI typeface is `Geist Variable`.

Rules:

- all interface text MUST use `Geist Variable`
- fallback fonts MAY remain generic sans-serif fallbacks
- alternate display fonts MUST NOT be introduced inside product UI

## Typography Principles

Typography in this app should remain:

- compact
- technical
- quiet
- semibold at key hierarchy points
- low in ornament

Hierarchy should come from role clarity, not from dramatic display styling.

## Text Roles

### Page Title

Use for the primary heading of a shell page.

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
- weight: medium when interactive emphasis is needed
- line height: compact

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

## Color Rules

Typography color MUST come from semantic tokens.

- primary text uses `foreground`
- supporting text uses `muted-foreground`
- destructive text uses `destructive`

## Reuse Rule

A new screen should not need to redefine:

- what a page title looks like
- what a card title looks like
- what helper text looks like
- what a timestamp looks like
- what compact control text looks like
