# Layout Specification

## Purpose

This document defines the layout system for the workspace shell.
It standardizes page structure, spacing rhythm, grids, panel composition, and responsive behavior.

## Ownership

This document owns shell structure, spacing roles, page archetypes, and responsive layout rules.
It does not define component-family styling details or typography roles.

## Layout Philosophy

The app is a product workspace, not a storytelling site.
Layouts MUST prioritize orientation, task flow, and scan speed.

Core traits:

- persistent shell structure
- compact utility spacing
- grid-based content organization
- clear separation between chrome and task content
- responsive adaptation through reflow, not redesign

The layout system is built around two spatial roles:

- `shell`: navigation, current context, global controls, and frame-level orientation
- `workspace`: the primary task surface where page-specific work happens

These roles MUST not collapse into the same visual treatment.
The shell should read as a continuous frame.
The workspace should read as an inset surface nested inside that frame.

## Shell Model

The default application structure is:

1. sticky top header
2. persistent left navigation on desktop
3. sheet-based navigation on narrow viewports
4. flexible content well to the right of navigation

Future product screens SHOULD inherit from this shell unless they are intentionally outside the
main workspace.

The shell is a single compositional object, not a pile of neighboring panels.

- header, sidebar, and tab strip SHOULD feel materially related
- shell regions SHOULD prefer shared surface color over explicit dividing lines
- shell subdivision SHOULD rely on spacing, alignment, and local controls before it relies on hard
  separators
- if a shell region needs emphasis, it SHOULD be achieved with local contrast rather than turning
  the full shell into stacked cards

## Header Rules

The header is compact, structural, and persistent.

- it MUST remain a control row rather than a hero band
- it SHOULD carry navigation context, shell actions, or search
- it MUST use structural separation rather than dramatic elevation
- it SHOULD visually belong to the sidebar and tab layer when those elements are part of the same
  shell
- it SHOULD avoid heavy borders that imply it is an isolated panel

## Content Well Rules

The main content area is where page-specific work happens.

- it SHOULD be modular and grid-oriented
- it SHOULD favor cards, sections, and split panels over long undifferentiated text flows
- it MUST preserve clear page hierarchy through spacing and section boundaries
- it MUST avoid marketing-style oversized hero regions
- it SHOULD read as an inset workspace surface rather than as a continuation of shell chrome
- it SHOULD use margin, radius, and background contrast to establish its own plane
- it MUST remain visually distinct from the shell even when the palette is neutral
- the default shell plane SHOULD consume `background`, while the default workspace plane SHOULD
  consume `card`

## Spacing Rhythm

The current shell uses a compact application rhythm.
Standard spacing roles include:

- shell edge padding
- section gap
- card padding
- local item gap
- dense control gap

Current implementation suggests these baseline roles:

- `p-4` to `p-6` for page and section padding
- `p-5` for common card padding
- `gap-6` for section separation
- `gap-4` for local grid and card-group separation
- `gap-2` and `gap-3` for dense inline UI

Future normalization should map these roles onto explicit spacing tokens.

## Grid Rules

The main content area SHOULD default to structured panel grids.

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

Suggested panel archetypes:

- summary metric card
- standard content panel
- split panel
- activity / feed panel

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

## Standard Page Archetypes

Future development should converge on a small set of page archetypes:

### Shell Dashboard

Use for overview screens, metrics, recent activity, and multi-panel workspaces.

### Settings / Detail Page

Use for account management, preferences, and detail forms.

### List / Table Page

Use for collections, records, assets, and filtered results.

### Editor / Workspace Page

Use for focused tool surfaces where the content well becomes the primary work zone.

## Anti-Patterns

The following should be rejected by default:

- hero banners inside the main shell
- turning header, sidebar, and tabs into unrelated card blocks
- using borders as the primary way to carve major layout zones apart
- making the content well look like it is flush with the shell when it is meant to be a workspace
  surface
- oversized empty whitespace bands
- inconsistent card padding from page to page
- bespoke breakpoint logic for one screen
- decorative asymmetry without task value
