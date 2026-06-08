# Host Component Pipeline Roadmap

## Purpose

Host UI currently has the right source ingredients but not a formal consumption
pipeline.

The CSS side is already structured:

```text
styles/tokens/*
-> styles/internal/*
-> semantic host classes
-> host composition
```

The component side should mirror that discipline:

```text
agent-html/components/ui/*
-> packages/cli/src/host/ui/*
-> host feature modules
```

`agent-html/components/ui/*` remains the Canvas primitive layer. The missing
piece is a host chrome adapter layer that defines how host features consume
those primitives consistently.

## Current Problem

Host feature files compose primitives directly and then patch local `className`
values per feature. This makes the UI feel MVP-like:

- sidebar rows use `SidebarMenuButton`;
- settings uses raw `DropdownMenuItem`;
- search uses raw `CommandItem`;
- theme preset and section controls use local `SelectHeaderItem`;
- theme editor popover options use `Button + canvas-theme-editor-option`.

These controls share a visual family, but their spacing, item content,
selection indicators, hover states, and trailing slots are not governed by one
contract.

The fix is not to fork shadcn primitives or create a second design system. The
fix is to add host-only adapters that compose local Canvas primitives through a
single host chrome contract.

## Taste Standard

Borrow component taste from `_archive/design/components.md`, not product
structure.

Applicable taste:

- compact
- neutral
- task-oriented
- accessible
- predictable
- dense enough for operational scanning
- quiet hover and selected states
- sidebar as a first-class component family
- menu and overlay primitives chosen by behavior, not visual similarity

Do not inherit old app architecture, routes, runtime assumptions, shell
ownership, or archived component imports. Archive material is comparison and
taste reference only.

Current law remains:

- `taste/design/DESIGN.md`
- `apps/docs/content/docs/canvas/design-system/index.mdx`
- `apps/docs/content/docs/canvas/host/index.mdx`
- `agent-html/styles/README.md`
- `agent-html/components/README.md`

## Target Pipeline

```text
agent-html/components/ui/*
  Generic local primitives: Button, Sidebar, Select, DropdownMenu, Command,
  Popover, Tooltip, Input, Collapsible, and related Radix/shadcn wrappers.

packages/cli/src/host/ui/*
  Host chrome adapters. These define host consumption, density, slots, and
  state presentation while preserving primitive behavior.

agent-html/styles/tokens/features/host.css
agent-html/styles/tokens/features/theme-editor.css
  Structural constants for host chrome, editor controls, item spacing,
  floating widths, icon size, swatch size, and row density.

agent-html/styles/internal/host.css
agent-html/styles/internal/theme-editor.css
  Semantic classes consumed by host adapters. Feature code should not invent
  repeated item/control styling.

packages/cli/src/host/*
  Feature modules compose host adapters and own state, data flow, and host
  behavior.
```

## Adapter Families

### Variant Taxonomy

Host feature modules express intent, not visual variants. Repeated visual
decisions belong in host adapters and semantic CSS classes.

Canonical host variant axes:

- row controls use intent, active/open/disabled state, and content slots;
- icon actions use placement and tone;
- floating surfaces use kind, size, and placement;
- status surfaces use tone and density;
- prompt controls use prompt state and target context;
- skeletons use target.

Do not add feature-local visual variants such as `toolbar-danger`,
`prompt-submit-primary`, or ad hoc active class names. If the same `className`
pattern appears twice, promote it into a host adapter variant or semantic
internal class.

### Shared Item Content

Create `HostItemContent` as the common row content contract.

It owns:

- leading icon slot;
- leading swatch slot;
- primary label slot;
- optional caption slot;
- optional shortcut slot;
- optional trailing slot;
- truncation and compression rules.

Standard:

- labels live in `min-w-0` and truncate;
- icons, swatches, status, checks, badges, and shortcuts never compress;
- a row has one primary target;
- interactive trailing actions must be component-owned slots or siblings, not
  loose flex children inside the label boundary.

### Swatches

Move theme-editor-private `ColorSwatch` into `HostSwatch`.

It owns:

- stable size variants;
- circular shape;
- ring/border treatment;
- color preview safety.

Preset swatches must use stable preset-derived colors, not live CSS variables
that change with the currently selected theme.

### Control Triggers

Create `HostControlTrigger` for host rows that open or perform an action.

Consumers:

- sidebar actions;
- select triggers;
- popover triggers;
- compact editor triggers.

Standard:

- compact height;
- consistent gap;
- coherent default, hover, open, active, disabled, and focus-visible states;
- text selection disabled for chrome controls;
- editable inputs remain selectable.

### Icon Actions

Create icon-only host actions through `HostIconButton`.

Allowed axes:

- `placement`: `toolbar`, `blockOverlay`, `prompt`;
- `tone`: `neutral`, `primary`.

`placement` decides host chrome placement and sizing hooks. `tone` decides
emphasis. Do not add combined values that mix placement and tone.

### Floating Content

Create host wrappers for floating surfaces:

- `HostSelectContent`
- `HostDropdownContent`
- `HostPopoverContent`
- `HostCommandDialog`
- `HostFloatingPromptPopoverContent`

They keep primitive behavior but standardize host chrome:

- `popover` / `popover-foreground` surface;
- `accent` / `accent-foreground` item states;
- restrained radius;
- compact padding;
- light ring/shadow;
- width from host structural tokens or trigger width.

Floating content must not reuse sidebar item tokens. Sidebar is persistent
chrome; popovers and menus are floating surfaces.

### Primitive-Specific Items

Do not create one universal item component. Keep semantic wrappers:

- `HostSelectItem`
- `HostDropdownItem`
- `HostCommandItem`
- `HostPopoverAction`
- `HostSidebarAction`

Each wrapper uses `HostItemContent`, but behavior stays with the owning
primitive.

Reason:

- `Select` sets one field value;
- `DropdownMenu` lists commands or choices;
- `CommandDialog` searches or runs commands across a set;
- `Popover` hosts compact editors, pickers, inspectors, or local metadata;
- `SidebarMenuButton` is persistent host navigation/action chrome.

## First Migration Slice

Start with sidebar and theme editor because they expose the inconsistency most
clearly.

1. Add `packages/cli/src/host/ui/item-content.tsx`.
2. Add `packages/cli/src/host/ui/swatch.tsx`.
3. Add `packages/cli/src/host/ui/control-trigger.tsx`.
4. Add `packages/cli/src/host/ui/select.tsx`.
5. Add `packages/cli/src/host/ui/dropdown.tsx`.
6. Add `packages/cli/src/host/ui/command.tsx`.
7. Add `packages/cli/src/host/ui/sidebar-action.tsx`.
8. Add `packages/cli/src/host/ui/popover.tsx`.

Then migrate:

- theme preset select;
- theme section select;
- settings dropdown;
- artifact search command;
- theme editor popover option buttons.

Keep the first slice behavior-preserving. The goal is to normalize consumption,
not redesign the host.

## CSS Work

Add adapter classes to existing internal styles instead of scattering Tailwind
utilities through host features.

Candidate classes:

- `canvas-host-item-content`
- `canvas-host-item-label`
- `canvas-host-item-caption`
- `canvas-host-item-trailing`
- `canvas-host-control-trigger`
- `canvas-host-floating-content`
- `canvas-host-swatch`

Use existing token files first. Add new tokens only when a repeated structural
value appears across multiple host adapters.

Do not tokenize every shadcn primitive value. Primitive internals may keep local
Tailwind density unless host consumption needs a stable contract.

## Acceptance Criteria

The pipeline is working when:

- host feature modules no longer hand-author repeated item content structures;
- select, dropdown, command, popover action, and sidebar action rows share label,
  icon, swatch, caption, and trailing slot behavior;
- primitive choice remains semantic;
- visual values flow through `agent-html/styles` tokens/internal classes;
- no archived app imports or product assumptions enter current host code;
- future host controls can be added by choosing a host adapter instead of
  copying `className` patterns.

## Non-Goals

- Do not fork `agent-html/components/ui/*`.
- Do not build a parallel design system.
- Do not move host behavior into `agent-html`.
- Do not make artifacts depend on host adapters.
- Do not rewrite all primitives to use Canvas host tokens.
- Do not migrate this roadmap into formal docs until the adapter shape has been
  proven in code.
