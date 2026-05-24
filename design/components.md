# Component Specification

## Purpose

This document standardizes the component language for the current operating shell.
It defines the expectations for major component families used across the app.

## Ownership

This document owns component-family standards and reuse expectations.
It does not define token flow, primitive-layer governance, or code-placement rules; those belong to
`constitution.md` and `code-structure.md`.

## Component Philosophy

Components in this app should remain:

- compact
- neutral
- task-oriented
- accessible
- predictable

They are not decorative objects.
They exist to support fast scanning and stable interaction.

## Button Standard

Buttons are compact utility controls.

Characteristics:

- compact height
- medium-emphasis typography
- rounded rectangle geometry
- clear primary, outline, ghost, and destructive distinction
- visible focus ring

Usage rules:

- `default` is the primary action button
- `outline` is the standard secondary action
- `ghost` is for shell chrome and low-emphasis controls
- `destructive` is reserved for risky actions
- `link` is for inline textual action only

Larger sizes should remain restrained and MUST NOT introduce marketing-button behavior.

## Input Standard

Inputs are short, dense, and neutral.

Characteristics:

- compact height
- rounded rectangle shape
- border-led definition
- restrained background treatment
- clear focus-visible and invalid states

Rules:

- input styling MUST remain quiet relative to surrounding layout
- invalid state MUST use the shared destructive and ring system
- placeholder styling MUST remain secondary

## Card and Panel Standard

Cards are the default content container.

Characteristics:

- surface from `card`
- text from `card-foreground`
- thin border
- medium radius
- optional light shadow
- compact internal spacing

Rules:

- cards SHOULD carry sections, data, or activity groupings
- cards MUST NOT depend on heavy branding or decorative gradients
- dashed internal blocks MAY be used for placeholders or segmentation only
- sidebar-hosted editor panels MAY use shell-facing surfaces instead of workspace cards when they
  belong to the shell itself

## Sidebar Standard

The sidebar is a first-class component family.

Characteristics:

- group-based navigation
- mode-aware header, body, and footer
- compact item heights
- icon-plus-label rows
- muted labels
- subtle hover and active states
- collapsible desktop behavior
- mobile sheet fallback

Rules:

- new navigation patterns SHOULD extend the sidebar family before creating a parallel system
- mode-specific sidebar views SHOULD still use the same sidebar primitives
- active states SHOULD remain subtle and neutral-first
- accent usage SHOULD stay scoped to orientation and navigation identity
- default active states SHOULD rely on foreground and surface, not font-weight changes
- `SidebarHeader` and `SidebarFooter` MAY host secondary-tone items
- secondary-tone sidebar items SHOULD default to weakened text and strengthen on hover
- secondary-tone sidebar items SHOULD NOT introduce hover background by default
- open and explicitly active secondary items MAY still claim local background emphasis
- current first-level sidebar menus use compact vertical rhythm with `gap-1`

The current implementation includes two stable sidebar uses:

1. workspace navigation sidebar
2. gallery-mode color editor sidebar

These are variants of the same shell family, not separate systems.

## Menu and Overlay Standard

Dropdowns, sheets, and tooltips extend the same shell language.

Rules:

- overlays MUST use the same radius family as core surfaces
- dropdown items MUST stay compact and scan-friendly
- tooltip styling SHOULD remain functional and minimal
- sheets SHOULD feel like shell extensions, not separate canvases

## Header and Tab Rail Standard

The header tab rail is part of the shell, not a page-level embellishment.

Rules:

- the tab rail MAY host project tabs or scene tabs
- scene tabs MAY be non-closable when they represent shell mode state rather than document state
- inactive shell tabs MAY use weakened sidebar text before hover
- active shell tabs SHOULD claim local workspace-like emphasis through surface and foreground

## Avatar and Identity Standard

Identity surfaces are supportive, not dominant.

Rules:

- avatars SHOULD stay compact
- avatar framing SHOULD remain subtle
- identity rows MAY combine avatar, primary label, and supporting line
- identity components MUST NOT overpower navigation or task content

## Component State Rules

Relevant components must account for:

- default
- hover
- active
- focus-visible
- disabled
- invalid where applicable
- selected / expanded / open where applicable

State treatment MUST be coherent across families.

For current shell navigation:

- secondary hover MAY strengthen text without adding background
- selected sidebar items SHOULD NOT become bold by default
- scene or project selection SHOULD remain readable through surface and foreground contrast

## Reuse Pipeline

The following page patterns should be promoted into explicit reusable composites once they recur:

- dashboard stat card
- section header row
- activity list item
- empty state block
- settings form section
- list toolbar
- gallery sidebar support panel
