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

Cards are a common content container, not the default shell surface.

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

## Settings Surface Standard

Settings dialogs currently use status, explanatory, and diagnostic shell composites. These are
settings-specific structure, not generic card replacements.

Rules:

- settings status surfaces represent chrome or live state and SHOULD disable text selection
- settings info surfaces carry readable explanation or errors and SHOULD preserve text selection
- settings diagnostic lists SHOULD keep labels non-selectable while preserving selectable values
- settings dialogs SHOULD compose these shell surfaces instead of hand-writing bordered status
  blocks
- diagnostic values such as thread ids, commands, paths, and cwd MUST remain copyable

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
- sidebar-hosted navigation, selection, and command rows SHOULD use the sidebar item-row surface:
  `SidebarMenu`, `SidebarMenuItem`, and `SidebarMenuButton`
- select, dropdown, and popover triggers inside the sidebar SHOULD reuse `SidebarMenuButton` as
  their visual shell; the overlay primitive owns behavior and floating content, not the sidebar row
  appearance
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

## Navigation Item Structure Standard

Tabs, sidebar rows, menu items, and select items belong to the same structural
family: compact selectable items with one primary target and optional supporting
slots. They do not share one component because their semantics differ.

New or touched navigation items MUST follow this layout discipline.

Rules:

- the primary hit target SHOULD own the main item surface
- labels MUST live in a compressible `min-w-0` content region and truncate
  inside that region
- leading icons, trailing status, and trailing actions MUST NOT be compressed by
  long labels
- interactive trailing actions such as close, duplicate, delete, or more menus
  SHOULD be sibling overlay controls or component-owned action slots
- primary targets MUST reserve inline space for overlay actions instead of
  letting actions compete with title layout
- static trailing meta such as a summary value, swatch, badge, or check state MAY
  be a flex sibling only when it is explicitly non-interactive, `shrink-0`, and
  separated from the label truncation boundary
- selection indicators inside menus and selects SHOULD use the menu or select
  primitive's indicator pattern rather than ad hoc `ml-auto` icons
- component families SHOULD keep their own semantics: shell document tabs use the
  shell tab rail composite, sidebar navigation uses sidebar primitives, menu
  choices use menu primitives, and form selections use select primitives
- visual surface ownership follows the host region: when a select or menu trigger
  appears as a sidebar row, its trigger surface SHOULD come from sidebar
  primitives even though its value, keyboard behavior, and floating content remain
  owned by the select or menu primitive

This standard is structural, not visual. It exists to keep titles readable,
actions stable, focus states unclipped, and overflow contained by the owning
rail, row, or menu.

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
- header zone, overflow, alignment, and protected window-control layout rules are owned by
  `layout.md`
- shell document tabs MUST use a shell tab rail composite rather than the generic content tab
  primitive
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
- selected sidebar items should prefer surface and foreground contrast over font-weight changes;
  existing font-weight active states are a normalization target
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
