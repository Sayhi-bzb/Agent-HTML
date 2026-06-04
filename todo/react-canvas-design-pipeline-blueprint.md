# React Canvas Design Pipeline Blueprint

## Core Idea

React Canvas needs a unified design pipeline that keeps agent-authored output
stable without turning local shadcn components into a large fork.

The target ownership model is:

```text
theme.css
  -> semantic token values

styles.css
  -> Tailwind, shadcn CSS, font imports, token bridge, and base styles

.agent-html/ui/*
  -> local visual primitives

artifact and host files
  -> compose primitives and semantic layout

@agent-html/react
  -> headless collaboration protocol
```

Agents express content, intent, data composition, and interaction meaning.
Canvas owns visual system consistency, reusable resources, guardrails, and host
collaboration boundaries.

## Token Pipeline

Color, radius, and font are the primary token-backed pipelines.

`styles/theme.css` owns semantic values:

```text
--background
--foreground
--card
--primary
--border
--ring
--chart-*
--sidebar-*
--radius
```

`styles.css` owns the runtime bridge:

```text
@import "tailwindcss"
@import "shadcn/tailwind.css"
@import "@fontsource-variable/geist"
@import "./styles/theme.css"

@theme inline
  -> maps semantic variables into Tailwind tokens
```

Artifacts do not import CSS entrypoints directly. They use semantic utilities
such as `bg-background`, `text-foreground`, `border-border`, `bg-card`, and
`text-muted-foreground`.

## Local UI Primitives

`.agent-html/ui/*` is the Canvas visual primitive layer. It is local source
generated from shadcn conventions, but Canvas owns how it is consumed.

Artifacts and host controls should use local primitives before hand-writing
common controls:

```text
Button
Card
Badge
Input
Table
Sidebar
Sheet
Tooltip
Alert
Skeleton
Chart
```

The primitive layer owns component semantics, variant APIs, accessibility
composition, state treatment, and the concrete class lists that make common UI
consistent.

Do not treat `.agent-html/ui/*` as an implementation detail to bypass from
artifact code. Do not create raw primitive buttons, inputs, tables, badges,
cards, sidebars, or dialogs in artifacts when a local primitive exists.

## Low-Modification shadcn Strategy

Do not rewrite all shadcn-derived UI primitives to tokenise every visual value.
That would create a high-maintenance local fork and make future component
updates expensive.

The default strategy is:

```text
color/radius/font
  -> theme.css + styles.css token pipeline

spacing/density/typography scale
  -> agent usage rules + guard checks + local primitive conventions

local UI source edits
  -> only for Canvas-required primitive APIs, correctness, or accessibility
```

Spacing, density, and typography scale are not fully tokenized by shadcn by
default. Many components encode them as Tailwind utilities such as `gap-4`,
`px-4`, `py-4`, `text-sm`, `text-base`, `font-medium`, and `leading-snug`.

Canvas should keep those component-level conventions stable and constrain agent
authored layout instead of refactoring every primitive.

## Agent Scale Discipline

Agents may use layout utilities when composing artifact structure:

```text
flex
grid
gap-2
gap-3
gap-4
gap-6
p-2
p-3
p-4
p-6
text-sm
text-base
leading-snug
leading-normal
min-w-0
overflow-hidden
truncate
```

Agents should avoid visual scale drift:

```text
raw palette classes
decorative gradients
arbitrary values
oversized radius
heavy shadows
custom font families
manual tracking
one-off button/card/table markup
```

When stricter enforcement is needed, prefer updating `.agent-html/AGENTS.md`,
Canvas docs, and React Canvas guard rules before changing every UI primitive.

## Headless Protocol Boundary

`@agent-html/react` remains headless.

`Artifact`, `Block`, and `Action` own collaboration metadata, stable anchors,
source extraction targets, action dispatch, accessibility minimums, and props
passthrough. They do not own visual treatment:

```text
no default page width
no default spacing
no default background or foreground color
no card or panel treatment
no dashboard grid
no app shell layout
```

Visual decisions belong in artifact composition, local UI primitives, and the
CSS token pipeline.

## Review Checks

Before changing the Canvas design surface, confirm:

- The change belongs to `theme.css`, `styles.css`, `.agent-html/ui/*`, guard
  rules, or docs.
- The change does not edit upstream shadcn packages or `node_modules`.
- The change does not scatter visual fixes into individual artifacts or host
  surfaces when a primitive or rule should own the behavior.
- `@agent-html/react` remains visual-free.
- Artifact and host code continue to consume local primitives.
- Raw colors, arbitrary values, oversized radius, heavy shadows, and typography
  drift remain out of agent-authored artifacts.

## Non-Goals

- Do not fork shadcn as a separate upstream dependency.
- Do not manually rewrite all generated UI primitives just to replace Tailwind
  spacing utilities with custom variables.
- Do not move component structure into `styles.css`.
- Do not put token values in artifact files.
- Do not add visual defaults to `Artifact`, `Block`, or `Action`.

## Summary

Canvas design stability comes from a layered pipeline:

```text
theme.css
  -> semantic values

styles.css
  -> Tailwind and shadcn bridge

.agent-html/ui/*
  -> visual primitives

AGENTS.md, docs, guard
  -> agent usage discipline

artifacts and host
  -> composition

@agent-html/react
  -> headless collaboration protocol
```

The design goal is not to make agents invent fewer things by removing React
freedom. The goal is to give agents reusable pipelines so they can focus on
meaningful artifact work while Canvas keeps visual and collaboration structure
stable.
