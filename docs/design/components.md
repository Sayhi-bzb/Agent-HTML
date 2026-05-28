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
- sidebar navigation chrome, menu rows, group labels, badges, actions, rails, and skeleton rows
  SHOULD disable text selection
- sidebar inputs, search fields, rename fields, and other editing controls MUST preserve normal text
  selection
- sidebar-hosted readable content MUST opt into selectable behavior explicitly instead of inheriting
  navigation defaults

The current implementation includes two stable sidebar uses:

1. workspace navigation sidebar
2. gallery-mode color editor sidebar

These are variants of the same shell family, not separate systems.

## Menu and Overlay Standard

Menus and overlays must be selected by interaction semantics, not by visual similarity.
Do not collapse all floating or expandable controls into one primitive.

Rules:

- overlays MUST use the same radius family as core surfaces
- dropdown items MUST stay compact and scan-friendly
- tooltip styling SHOULD remain functional and minimal
- sheets SHOULD feel like shell extensions, not separate canvases
- `Collapsible` MUST be used for content that already belongs to the page structure and only needs
  inline expand / collapse behavior
- `Popover` SHOULD be used for temporary floating panels with custom content, such as compact
  editors, pickers, or non-menu controls
- `DropdownMenu` SHOULD be used for action menus, configuration menus, submenus, checkbox menus, and
  radio menus
- `Select` SHOULD be used when the user is setting a form field value
- `CommandDialog` SHOULD be used for search, fuzzy filtering, or cross-surface command entry
- `Dialog` SHOULD be used for blocking tasks that require explicit completion, confirmation, or
  dismissal
- `Dialog` SHOULD own form-like or settings-like work where the user completes a task inside the
  overlay, such as creating a project or editing connection settings
- `AlertDialog` SHOULD own risky confirmations, destructive actions, and leave/discard flows where
  the user is confirming whether an already-started action should proceed
- app-level confirmation flows SHOULD use the shell confirmation composite before composing
  `AlertDialog` directly in a feature surface
- `Sheet` SHOULD be used for edge-attached drawers, mobile sidebar behavior, or large auxiliary
  panels
- `Tooltip` MUST remain explanatory only and MUST NOT contain interactive controls
- standard menus SHOULD use `DropdownMenu` rather than a `Popover` that imitates menu behavior
- complex editors SHOULD use `Popover`, `Dialog`, or `Sheet` rather than `DropdownMenu`
- command palettes SHOULD disable selection for their chrome, groups, empty states, and result
  rows while preserving normal text selection inside the command input
- floating surfaces MUST consume `popover` / `popover-foreground`; their interactive item states
  SHOULD consume `accent` / `accent-foreground`
- sidebar surfaces MUST consume `sidebar*`; sidebar item tokens MUST NOT be reused inside popover or
  dropdown content

Current mappings:

- workspace project / section navigation uses `Collapsible`
- gallery editor color role groups use `Collapsible`
- gallery header theme and config dimension menus use `DropdownMenu`
- gallery color-token editing uses `Popover`
- app settings uses `DropdownMenu`
- project search uses `CommandDialog`
- mobile sidebar behavior uses `Sheet`

### Confirmation Dialog Standard

Confirmation dialogs are for decisions that affect existing user work or irreversible structure.
They are not generic modals.

Rules:

- app-level confirmations SHOULD use the shell confirmation composite
- feature surfaces SHOULD pass intent and callbacks into the composite instead of composing
  `AlertDialog` directly
- leave-with-unsaved-changes flows SHOULD offer explicit save, discard, and cancel paths when both
  saving and discarding are valid outcomes
- destructive confirmations SHOULD use the `destructive` button variant for the committing action
- cancel SHOULD close the dialog without changing user data or navigation state
- confirmation titles SHOULD name the decision, not the implementation detail
- descriptions SHOULD explain the consequence of the next action in one short sentence

Current mappings:

- Gallery theme exit uses a save / discard / cancel confirmation
- workspace project and section deletion use destructive confirmations

## Header and Tab Rail Standard

The header tab rail is part of the shell, not a page-level embellishment.

Tab roles are intentionally split:

- content tabs switch panels inside a page or card
- runtime tabs render Agent-HTML output
- shell document tabs represent open app contexts in the header chrome

Rules:

- the tab rail MAY host section document tabs or scene tabs
- workspace mode tab rail SHOULD host open section documents
- Gallery mode tab rail SHOULD host first-level Gallery views
- scene tabs MAY be non-closable when they represent shell mode state rather than document state
- Gallery view-local navigation, filters, and preview selectors SHOULD stay inside the active view
  instead of becoming header tabs
- the header tab rail MUST not compete with window controls for space
- overflowing tabs SHOULD scroll horizontally inside the tab rail viewport
- header tab rail scrollbars MUST NOT be visible or consume header layout height
- active tab affordances MUST NOT depend on bottom-aligned layout or share space with scrollbars
- shell document tab rails MUST reserve vertical visual space for active and focus states so
  rounded corners, rings, and local elevation are not clipped by the scroll viewport
- window controls are protected shell chrome and MUST remain visible and clickable when tabs overflow
- shell document tabs MUST use a shell tab rail composite rather than the generic content tab
  primitive
- shell document tabs MUST share the header chrome vertical centerline with sidebar and window
  control icons
- shell document tabs SHOULD compress within the available middle zone before overflowing
  horizontally
- shell document tabs MUST keep a readable minimum width; compression must not reduce labels to
  ambiguous two- or three-character fragments
- shell document tabs MUST preserve tablist keyboard navigation for arrow, home, and end keys
- workspace shell document tabs MAY support drag-and-drop reorder; fixed navigation tabs such as
  Gallery views MUST NOT reorder
- tab reorder MUST preserve click selection, close button behavior, horizontal scrolling, and
  protected window drag regions
- close actions in shell document tabs SHOULD be overlay actions anchored to the right side of the
  tab surface, not flex siblings that consume title layout width
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

## Selection and Cursor Standard

The app MUST NOT globally disable text selection.

Rules:

- content, generated output, code, document text, and editable fields SHOULD remain selectable
- controls, menus, tabs, labels, chrome, decorative elements, scrollbars, and drag handles SHOULD
  disable text selection
- command palettes and picker overlays SHOULD be treated as controls; their inputs remain editable
  and selectable
- navigation surfaces such as sidebars and header tab rails SHOULD be treated as controls, not
  document content
- shell chrome MAY use `data-selection="none"` to prevent accidental selection during click and
  drag interactions
- selectable content roots MAY use `data-selection="text"` when they sit inside a broader
  non-selectable shell area
- cursor styling SHOULD describe interaction semantics: action controls use `data-cursor="action"`,
  drag handles use `data-cursor="drag"`, active drag feedback uses `data-cursor="dragging"`, and
  explicit selectable text affordances use `data-cursor="text"`
- desktop drag regions are window-management boundaries only; `data-tauri-drag-region` MUST NOT be
  used as a substitute for content selection rules

Current mappings:

- header chrome and tab rail disable text selection
- shared buttons, menu items, command items, select items, labels, and scrollbars disable text
  selection
- runtime viewport, runtime text, and code bodies remain selectable
- runtime block handles, code headers, copy buttons, and code line numbers disable text selection

## Reuse Pipeline

The following page patterns should be promoted into explicit reusable composites once they recur:

- dashboard stat card
- section header row
- activity list item
- empty state block
- settings form section
- list toolbar
- gallery sidebar support panel
