# React Canvas Host Editor View Blueprint

## Core Idea

React Canvas host needs an editor view for previewing token pipeline changes
inside the same shell that renders artifacts.

The editor view is a host capability:

```text
left sidebar
  -> artifact navigation or theme token editing

center surface
  -> live artifact preview

right sidebar
  -> AI prompt handoff
```

The first implementation is preview-only. It updates CSS variables in the
browser and does not write `.agent-html/styles/theme.css`.

The editor should make the token pipeline visible without moving style decisions
into artifacts.

## Design Reference

Use the app Gallery theme editor as the interaction reference, not as a code
dependency.

The useful pattern is:

```text
sidebar header
  -> preset select
  -> editor section select

sidebar content
  -> section-local token rows
  -> each row opens a compact popover editor

sidebar footer
  -> current preview state
  -> reset preview action
```

This follows the sidebar and overlay standards in `design/components.md`:

- sidebar rows use `SidebarMenu`, `SidebarMenuItem`, and `SidebarMenuButton`
- select triggers inside the sidebar reuse `SidebarMenuButton` as the visual
  shell
- popovers own compact editors and pickers
- dropdown menus are not used as complex editors
- popover content consumes `popover` tokens, not `sidebar` tokens

It also follows the shell model in `design/layout.md`:

- the sidebar may swap from navigation to editor use without losing shell
  identity
- the center surface stays the hosted workspace
- mode changes reuse the same shell rather than creating another full-screen
  layout

## Sidebar Editor Shape

The host editor should keep the same compact row language as the app Gallery
editor.

Recommended shape:

```text
AgentHTML
[Theme preset select]
[Editor section select]

Color
  Background
    background          zinc / 50      swatch
    foreground          zinc / 900     swatch
  Primary
    primary             blue / 600     swatch
    primary foreground  zinc / 50      swatch

Footer
  Preview active
  Reset preview
```

Each token row should show:

- a short label
- a current value summary
- a trailing preview when useful, such as a color swatch

Rows should stay dense and scannable. Long token names should truncate inside a
`min-w-0` content region. Swatches, badges, and check states must remain
`shrink-0`.

## Editor Sections

Use these first-level sections:

```text
Color
Typography
Radius
Spacing
Canvas
Shadow
```

`Color` owns shadcn and sidebar color tokens:

```text
--background
--foreground
--card
--card-foreground
--popover
--popover-foreground
--primary
--primary-foreground
--secondary
--secondary-foreground
--muted
--muted-foreground
--accent
--accent-foreground
--destructive
--border
--input
--ring
--chart-*
--sidebar*
```

`Typography` owns font and tracking tokens:

```text
--font-sans-source
--font-heading-source
--font-sans
--font-heading
--font-mono
--tracking-normal
```

`Radius` owns:

```text
--radius-base
--radius
```

`Spacing` owns:

```text
--spacing
```

`Canvas` owns artifact reading layout tokens:

```text
--canvas-artifact-max-width
--canvas-artifact-block-gap
--canvas-artifact-background
--canvas-artifact-foreground
```

If block highlight spacing becomes editable, it belongs in `Canvas`, not in
artifact source.

`Shadow` owns:

```text
--shadow-color
--shadow-opacity
--shadow-x
--shadow-y
--shadow-blur
--shadow-spread
--shadow-*
```

## Control Patterns

### Color Rows

Color rows should match the Gallery editor behavior:

```text
sidebar row
  -> label
  -> family / step value
  -> color swatch

popover
  -> Family selector
  -> Step selector
  -> option list with swatches
```

Use Tailwind color families and steps as the compact editing model when the
current value maps to a Tailwind color.

When a value is an arbitrary CSS color, show the raw value and a swatch. The
first preview-only implementation may keep arbitrary values read-only unless a
simple color input is needed.

### Range Rows

Range rows should use a popover with:

```text
slider
number input
unit label
```

Use range rows for radius, spacing, canvas max width, block gap, tracking, and
shadow numeric fields.

### Select Rows

Select rows should be used for font choices and editor section choices.

The trigger surface belongs to the sidebar row. The selection behavior belongs
to the select primitive.

## Preview Pipeline

The editor should keep a host-local draft:

```text
CanvasThemeDraft
  -> cssVariables: Partial<Record<`--${string}`, string>>
```

Changing a token updates the draft and injects a managed style element:

```text
<style id="react-canvas-theme-editor-preview">
  :root {
    --background: ...;
    --radius: ...;
    --canvas-artifact-max-width: ...;
  }
</style>
```

The preview style should be injected after the preset style so editor changes
win over the selected preset.

Reset preview removes the editor preview style and restores the selected preset
preview.

Do not call the preview action `Apply` or `Save` in the first version. The user
must not mistake preview-only state for a write to `.agent-html/styles/theme.css`.

## Architecture Boundaries

The host must not import app Gallery code.

Allowed:

```text
packages/cli/src/host/*
  -> host editor implementation

#agent-html-playground/ui/*
  -> local Canvas UI primitives

#agent-html-playground/theme/*
  -> Canvas theme presets and token metadata
```

Forbidden:

```text
@/app/*
apps/agent-html-app/*
packages/agent-html/*
@example/*
```

The host may copy the interaction pattern from the app editor, but not its
module dependencies.

Artifacts remain style-free at the collaboration boundary:

- do not add `style` or visual props to `Artifact`, `Block`, or `Action`
- do not move editor state into artifact files
- do not make artifacts import theme editor helpers
- do not use host editor work as a reason to loosen guard rules

## Implementation Notes

Recommended files:

```text
packages/cli/src/host/theme-editor.tsx
packages/cli/src/host/theme-editor-sections.ts
packages/cli/src/host/theme-draft.ts
packages/cli/src/host/theme-preview.ts
```

The current host sidebar can gain a local view state:

```text
activeSidebarView: "artifacts" | "theme"
```

When the view is `artifacts`, keep the existing artifact selector.

When the view is `theme`, render the editor header, editor section body, and
preview footer.

The center artifact surface should not change. Editor changes should affect it
only through CSS variables.

## Future Save Pipeline

Persistent saving is a separate design.

If host editor changes should write `.agent-html/styles/theme.css`, add a
separate dev-server API and document:

- path ownership
- validation
- parsing and formatting
- conflict behavior
- undo/reset behavior
- guard coverage

Do not hide a file-writing feature behind the preview-only editor.

## Review Checks

Before implementing the editor view, confirm:

- the sidebar still uses the sidebar primitive family
- preset select and section select use sidebar row triggers
- token rows are compact and scan-friendly
- color rows include Tailwind color preview swatches
- popover editors use `popover` tokens
- sidebar and popover token roles are not mixed
- preview styles override presets but do not write files
- reset removes the managed preview style
- artifact source stays unchanged
- host code does not import app Gallery modules
- boundaries tests still protect host, artifact, and app ownership

## Non-Goals

- Do not implement persistent save in the first editor view.
- Do not copy app Gallery modules into the host bundle.
- Do not create a second full-screen editor shell.
- Do not put token values into artifact source.
- Do not loosen React Canvas guard rules.
- Do not rewrite shadcn primitives to support this editor.
