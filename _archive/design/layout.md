# Layout Specification

## Purpose

This document defines the layout system for the current operating shell.
It standardizes mode structure, spacing rhythm, grids, panel composition, and responsive behavior.

## Ownership

This document owns shell structure, header spatial structure, spacing roles, page archetypes, and
responsive layout rules.
It does not define component-family styling details, tab component semantics, or typography roles.

## Layout Philosophy

Layouts MUST preserve orientation, task flow, and scan speed inside the operating shell.
Product feel is owned by `DESIGN.md`; this file owns spatial structure.

The layout system is built around two spatial roles:

- `shell`: navigation, current context, global controls, and frame-level orientation
- `workspace`: the primary hosted work surface where page-specific work happens

These roles MUST not collapse into the same visual treatment.
The shell is the durable frame. The workspace is the hosted work surface.

## Mode Model

The current implementation has two first-class operating modes:

### Workspace Mode

- header tabs represent open section documents
- sidebar header hosts search
- sidebar body hosts project navigation
- sidebar footer hosts utility entry points
- content well hosts the project working surface

### Gallery Mode

- header tabs represent gallery views such as Theme, Components, and Pets
- sidebar header hosts a back action and active-view controls
- sidebar body hosts the active view's editor, filters, or local navigation
- sidebar footer hosts active-view actions or metrics when that view has commit state
- content well hosts the active gallery view surface

Mode changes SHOULD reuse the same shell rather than create a separate full-screen layout family.

## Shell Model

The default application structure is:

1. sticky top header
2. persistent left navigation on desktop
3. sheet-based navigation on narrow viewports
4. flexible content well to the right of navigation

New product screens should inherit from this shell by default unless they are intentionally outside
the main product frame.

The shell is a single compositional object, not a pile of neighboring panels.
Surface hierarchy and visual tone are owned by `DESIGN.md` and `tokens.md`.

The current shell uses these mode-aware continuity rules:

- the header owns the current tab rail in both modes
- the sidebar MAY swap from navigation to editor use without losing shell identity
- the content well MAY change task role without changing its hosted spatial role

## Header Rules

The header is compact, structural, and persistent.

- it SHOULD carry navigation context, shell actions, or fixed Gallery view tabs
- in Gallery mode, it SHOULD carry stable first-level Gallery views rather than view-local filters
  or preview scenes
- it MAY switch between closable work tabs and non-closable Gallery view tabs without changing its base
  shell treatment
- it MUST preserve three structural zones: leading chrome, tab rail, and protected window controls
- the tab rail MUST stay inside the middle zone and handle overflow within that zone
- tab rail overflow MUST use a hidden, non-layout-affecting horizontal scrollport
- tab text and tab actions MUST align to the same vertical centerline as header chrome icons
- tabs SHOULD compress inside the middle zone before horizontal overflow is introduced
- window controls MUST remain visible and interactive; tabs MUST NOT overlap or obscure them
- desktop window headers SHOULD preserve a small stable drag gutter outside the tab hit targets
  when tabs can fill the middle zone; tab gaps and rounded corners MUST NOT be the only draggable
  affordance

## Content Well Rules

The main content area is where page-specific work happens. The current direction is an inset,
structured work surface; individual screens may still be at different stages of normalization.

- new or substantially touched surfaces SHOULD be modular and grid-oriented
- new or substantially touched surfaces SHOULD favor cards, sections, and split panels over long
  undifferentiated text flows
- it MUST preserve clear page hierarchy through spacing and section boundaries
- it SHOULD read as an inset workspace surface rather than as a continuation of shell chrome
- it SHOULD use margin, radius, and background contrast to establish its own plane
- it SHOULD remain visually distinct from the shell even when the palette is neutral
- the default shell plane SHOULD consume `background`, while the inset workspace plane SHOULD be
  established through neutral surface separation rather than by assuming all hosted panels consume
  `card`
- desktop content wells SHOULD use structured horizontal space, split regions, and compact grids
  before adding vertical height or decorative whitespace

## Spacing Rhythm

The current shell uses a compact application rhythm.
Standard spacing roles include:

- shell edge padding
- section gap
- card padding
- local item gap
- dense control gap

Spacing SHOULD support density and orientation. Avoid using large gaps, tall minimum heights, or
extra section padding as a substitute for clear alignment and information hierarchy.

Reusable spacing scales and structural constants belong to `tokens.md`.

## Grid Rules

New or substantially touched content areas SHOULD default to structured panel grids.

- dashboards SHOULD use card grids and split panels
- denser secondary sections MAY use asymmetric column ratios
- cards SHOULD align cleanly across rows
- grids SHOULD collapse progressively on smaller viewports

## Panel Rules

Panels are the standard content container at the layout level.

- panels SHOULD define modular sections
- panel headers SHOULD remain simple and dense
- spacing inside panels SHOULD stay consistent across pages
- panels inside the workspace SHOULD feel like secondary structure inside the main work surface,
  not like peers of the shell itself
- panels SHOULD use internal spacing, headings, separators, alignment, and state markers before
  introducing another visible container layer
- panels MUST NOT default to card-inside-card or section-inside-section structures unless the inner
  surface represents a distinct object, placeholder, disclosure, or interaction scope

## Responsive Rules

Responsive behavior MUST preserve the same layout system.

- desktop keeps shell chrome expanded
- tablet compresses density before changing component identity
- mobile stacks multi-column content into a single flow
- mobile hides persistent navigation and uses a sheet instead
- page hierarchy MUST remain recognizable after collapse

Responsive changes SHOULD alter structure first:

- columns to rows
- persistent nav to sheet
- split panels to stacked panels

Responsive collapse MUST preserve the shell/workspace distinction even when the sidebar becomes a
sheet.
Navigation may change its delivery mechanism, but it should not change its spatial role.

## Anti-Patterns

The following should be rejected by default:

- hero banners inside the main shell
- turning header, sidebar, and tabs into unrelated card blocks
- using borders as the primary way to carve major layout zones apart
- making the content well look like it is flush with the shell when it is meant to be a workspace
  surface
- oversized empty whitespace bands
- inconsistent card padding from page to page
- nested container or stacked-cake layouts where visual hierarchy comes from repeated cards,
  borders, backgrounds, and radii instead of stable planes and clear structure
- bespoke breakpoint logic for one screen
- decorative asymmetry without task value
- creating a second shell for a mode change that could live inside the current operating frame
