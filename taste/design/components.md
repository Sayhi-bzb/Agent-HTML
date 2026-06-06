# Component Specification

## Purpose

This document standardizes component-family behavior for the current operating shell.
It defines how reusable UI families should behave and when one primitive family should be chosen
over another.

## Ownership

This document owns component-family standards, primitive selection semantics, and shared component
state expectations.
It does not define product feel, token flow, page layout, header spatial structure, or code
placement. Those belong to `DESIGN.md`, `tokens.md`, `layout.md`, and `code-structure.md`.
Loading, selection, menu, and overlay rules belong here only while they describe component-family
behavior; broader interaction policy should move to a dedicated owner instead of accumulating here.

## Component Philosophy

Components in this app should remain:

- compact
- neutral
- task-oriented
- accessible
- predictable

They are not decorative objects. They exist to support fast scanning and stable interaction.

## Button Standard

Buttons are compact utility controls.

Rules:

- `default` is the primary action button.
- `outline` is the standard secondary action.
- `ghost` is for shell chrome and low-emphasis controls.
- `destructive` is reserved for risky actions.
- `link` is for inline textual action only.
- larger sizes MUST remain restrained and MUST NOT introduce marketing-button behavior.

## Input Standard

Inputs are short, dense, and neutral.

Rules:

- input styling MUST remain quiet relative to surrounding layout.
- invalid state MUST use the shared destructive and ring system.
- placeholder styling MUST remain secondary.
- editable text MUST preserve normal text selection.

## Card Standard

Cards are content containers, not the default shell surface or default wrapper.
Layout-level panel placement and nested-container rules are owned by `layout.md`.

Rules:

- cards SHOULD carry modules, objects, list items, placeholders, disclosures, data, or activity
  groupings.
- cards MUST consume `card` and `card-foreground`.
- cards MUST NOT depend on heavy branding or decorative gradients.
- dashed internal blocks MAY be used for placeholders or segmentation only.

## Information Density Standard

Operational components should use space to improve scanning, comparison, and action speed.

Rules:

- high-frequency decision data SHOULD stay visible in the default surface.
- low-frequency metadata, explanations, diagnostics, and auxiliary controls SHOULD move into a
  suitable disclosure primitive.
- work-oriented cards, rows, and lists SHOULD organize identity, status, metadata, and actions
  horizontally before adding vertical sections.
- catalog-like summaries SHOULD default to truncation or line clamping rather than turning a card
  into a reading flow.
- repeated filters, navigation, status, or summary text SHOULD have one owner.

## Sidebar Standard

The sidebar is a first-class component family.

Rules:

- new navigation patterns SHOULD extend the sidebar family before creating a parallel system.
- mode-specific sidebar views SHOULD still use the same sidebar primitives.
- sidebar-hosted navigation, selection, and command rows SHOULD use `SidebarMenu`,
  `SidebarMenuItem`, and `SidebarMenuButton`.
- select, dropdown, and popover triggers inside the sidebar SHOULD reuse `SidebarMenuButton` as
  their visual shell; the overlay primitive owns behavior and floating content.
- active states SHOULD rely on surface and foreground, not heavier font weight.
- accent usage SHOULD stay scoped to orientation and navigation identity.
- `SidebarHeader` and `SidebarFooter` MAY host secondary-tone items.
- secondary-tone sidebar items SHOULD default to weakened text and strengthen on hover.
- secondary-tone sidebar items SHOULD NOT introduce hover background by default.
- sidebar chrome, navigation rows, labels, badges, actions, rails, and skeleton rows SHOULD disable
  text selection.
- sidebar inputs, search fields, rename fields, and readable content MUST preserve or explicitly
  opt into text selection.

## Navigation Item Structure Standard

Tabs, sidebar rows, menu items, and select items belong to the same structural family: compact
selectable items with one primary target and optional supporting slots. They do not share one
component because their semantics differ.

Rules:

- the primary hit target SHOULD own the main item surface.
- labels MUST live in a compressible `min-w-0` content region and truncate inside that region.
- leading icons, trailing status, and trailing actions MUST NOT be compressed by long labels.
- interactive trailing actions SHOULD be sibling overlay controls or component-owned action slots.
- primary targets MUST reserve inline space for overlay actions instead of letting actions compete
  with title layout.
- static trailing meta MAY be a flex sibling only when it is non-interactive, `shrink-0`, and
  separated from the label truncation boundary.
- selection indicators inside menus and selects SHOULD use the owning primitive's indicator pattern.
- shell document tabs use the shell tab rail composite; content tabs use the generic tabs primitive.

## Menu and Overlay Standard

Menus and overlays must be selected by interaction semantics, not visual similarity.

Rules:

- overlays MUST use the same radius family as core surfaces.
- dropdown items MUST stay compact and scan-friendly.
- floating surfaces MUST consume `popover` and `popover-foreground`.
- interactive states inside floating surfaces SHOULD consume `accent` and `accent-foreground`.
- sidebar item tokens MUST NOT be reused inside popover or dropdown content.
- `Tooltip` explains briefly and MUST NOT contain interactive controls or task-critical content.
- `Collapsible` reveals inline structure that already belongs to the current page, sidebar, card,
  or popover flow.
- `Popover` opens a temporary panel for item-local metadata, compact editors, pickers, inspectors,
  or non-menu controls.
- `DropdownMenu` lists commands or menu choices and MUST NOT imitate a metadata drawer or complex
  editor.
- `Select` sets one field value.
- `CommandDialog` searches or runs commands across a set.
- `Dialog` hosts blocking tasks, forms, or settings that require completion, save, cancel, or test.
- `AlertDialog` confirms destructive, irreversible, discard, overwrite, or leave-with-unsaved-work
  decisions.
- app-level confirmations SHOULD use the shell confirmation composite before composing
  `AlertDialog` directly.
- `Sheet` hosts edge-attached drawers, mobile sidebar behavior, or large auxiliary panels.
- `Accordion` groups multiple peer disclosure sections and SHOULD NOT be used for a single details
  block.

Object-local disclosures SHOULD inherit identity from their trigger surface and SHOULD NOT repeat
the parent icon, title, summary, or status unless the disclosure can be opened detached from that
context.

## Header Tab Semantics

Header spatial structure, overflow, protected window controls, and mode placement belong to
`layout.md`. This section only defines tab family semantics.

Rules:

- content tabs switch panels inside a page or card.
- runtime tabs render Agent-HTML output.
- shell document tabs represent open app contexts in the header chrome.
- shell document tabs MUST use a shell tab rail composite rather than the generic content tab
  primitive.
- shell document tabs MUST preserve readable labels, tablist keyboard navigation, close behavior,
  horizontal scrolling, and drag-region safety.
- workspace shell document tabs MAY support drag-and-drop reorder; fixed navigation tabs such as
  Gallery views MUST NOT reorder.
- close actions in shell document tabs SHOULD be overlay actions anchored to the right side of the
  tab surface.

## Identity Standard

Identity surfaces are supportive, not dominant.

Rules:

- avatars SHOULD stay compact.
- avatar framing SHOULD remain subtle.
- identity rows MAY combine avatar, primary label, and supporting line.
- identity components MUST NOT overpower navigation or task content.

## Component State Rules

Relevant components MUST implement the state vocabulary defined by `constitution.md`.
State treatment MUST remain coherent across families.

For current shell navigation:

- secondary hover MAY strengthen text without adding background.
- selected sidebar items SHOULD prefer surface and foreground contrast over font-weight changes.
- scene or project selection SHOULD remain readable through surface and foreground contrast.

## Loading State Standard

Loading state is structural, not explanatory.

Rules:

- primary panels MUST NOT use a blank surface, isolated `Loading...` text, or a large explanatory
  card as their default loading state.
- predictable structures SHOULD use skeletons that approximate final geometry.
- lazy and Suspense fallbacks SHOULD resemble the final region they are loading.
- action-scoped waits SHOULD use local pending treatment on the triggering control or a compact
  status region.
- text explanations are for errors, empty states, permission problems, or blocked states.
- skeletons SHOULD stay quiet: muted surfaces, inherited radius, subtle motion, and no brand color,
  strong shimmer, heavy shadow, or additional container layer.

## Selection and Cursor Standard

The app MUST NOT globally disable text selection.

Rules:

- content, generated output, code, document text, and editable fields SHOULD remain selectable.
- controls, menus, tabs, labels, chrome, decorative elements, scrollbars, and drag handles SHOULD
  disable text selection.
- command palettes and picker overlays are controls; their inputs remain editable and selectable.
- navigation surfaces such as sidebars and header tab rails SHOULD be treated as controls, not
  document content.
- shell chrome MAY use `data-selection="none"`.
- selectable content roots MAY use `data-selection="text"` inside broader non-selectable chrome.
- cursor styling SHOULD describe interaction semantics through `data-cursor`.
- `data-tauri-drag-region` MUST NOT replace content selection rules.
