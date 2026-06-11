# L0 To L1

This file maps observed L0 raw values to current L1 named tokens.

L0 is the raw material. L1 is the first semantic wrapper: named values with
stable roles such as `background`, `muted`, `success`, content spacing, or
host chrome dimensions.

## Foundation Theme Tokens

Raw color values in `agent-html/styles/tokens/foundation.css` are wrapped by
global semantic theme tokens:

```css
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
--success
--success-foreground
--warning
--warning-foreground
--info
--info-foreground
--destructive
--destructive-foreground
--border
--input
--ring
--chart-1
--chart-2
--chart-3
--chart-4
--chart-5
```

Foundation raw typography, spacing, radius, tracking, and shadow values are
wrapped by:

```css
--radius
--spacing
--font-sans
--font-heading
--font-serif
--font-mono
--tracking-normal
--shadow-2xs
--shadow-xs
--shadow-sm
--shadow
--shadow-md
--shadow-lg
--shadow-xl
--shadow-2xl
```

Sidebar theme aliases map to existing semantic primitives:

```css
--sidebar
--sidebar-foreground
--sidebar-primary
--sidebar-primary-foreground
--sidebar-accent
--sidebar-accent-foreground
--sidebar-border
--sidebar-ring
```

Canvas text selection wraps color-mix values:

```css
--canvas-text-selection-background
--canvas-text-selection-foreground
```

## Content Tokens

Raw spacing, text, and content size values in
`agent-html/styles/tokens/features/content.css` are wrapped by artifact-facing
content tokens:

```css
--canvas-content-gap-xs
--canvas-content-gap-sm
--canvas-content-gap-md
--canvas-content-gap-lg
--canvas-content-gap-xl
--canvas-content-panel-padding-sm
--canvas-content-panel-padding-md
--canvas-content-icon-box-size-sm
--canvas-content-icon-box-size-md
--canvas-content-title-font-size
--canvas-content-title-line-height
--canvas-content-heading-font-size
--canvas-content-heading-line-height
--canvas-content-body-font-size
--canvas-content-body-line-height
--canvas-content-caption-font-size
--canvas-content-caption-line-height
--canvas-content-grid-gap
```

These are consumed by L2 public classes such as `canvas-stack-sm`,
`canvas-text-caption`, and `canvas-content-panel`.

## Host Tokens

Raw host spacing, z-index, width, and size values in
`agent-html/styles/tokens/features/host.css` are wrapped by host chrome tokens:

```css
--canvas-block-highlight-background
--canvas-block-highlight-border
--canvas-block-highlight-padding
--canvas-block-reply-badge-offset
--canvas-surface-padding-inline
--canvas-surface-padding-block-start
--canvas-surface-padding-block-end
--canvas-toolbar-inset-block-start
--canvas-toolbar-inset-inline
--canvas-toolbar-z-index
--canvas-sidebar-section-padding
--canvas-sidebar-content-padding-inline
--canvas-sidebar-stack-gap
--canvas-sidebar-header-gap
--canvas-sidebar-menu-gap
--canvas-sidebar-control-gap
--canvas-sidebar-title-font-size
--canvas-sidebar-body-font-size
--canvas-sidebar-caption-font-size
--canvas-host-item-icon-size
--canvas-host-swatch-size-xs
--canvas-host-swatch-size-sm
--canvas-host-select-content-max-height
--canvas-create-artifact-composer-width
--canvas-floating-prompt-width
--canvas-floating-prompt-z-index
--canvas-block-message-panel-width
```

These tokens are not artifact content API. They belong to host chrome,
sidebar, toolbar, prompts, and block overlay behavior.

## Theme Editor Tokens

Raw theme-editor control values in
`agent-html/styles/tokens/features/theme-editor.css` are wrapped by:

```css
--canvas-theme-editor-popover-width-sm
--canvas-theme-editor-popover-width-md
--canvas-theme-editor-popover-width-lg
--canvas-theme-editor-popover-padding-sm
--canvas-theme-editor-popover-padding-md
--canvas-theme-editor-popover-gap
--canvas-theme-editor-field-gap
--canvas-theme-editor-section-gap
--canvas-theme-editor-row-gap
--canvas-theme-editor-row-padding-block
--canvas-theme-editor-option-gap
--canvas-theme-editor-option-padding-inline
--canvas-theme-editor-option-padding-block
--canvas-theme-editor-control-padding-inline
--canvas-theme-editor-control-padding-block
--canvas-theme-editor-control-min-height
--canvas-theme-editor-color-input-height
--canvas-theme-editor-swatch-size-xs
--canvas-theme-editor-swatch-size-sm
--canvas-theme-editor-icon-size
--canvas-theme-editor-menu-max-height
--canvas-theme-editor-picker-preview-gap
--canvas-theme-editor-unit-width
```

## Code Block Tokens

Raw diff color and mix values in
`agent-html/styles/tokens/features/code-block.css` are wrapped by:

```css
--canvas-code-block-diff-add
--canvas-code-block-diff-add-background
--canvas-code-block-diff-add-foreground
--canvas-code-block-diff-remove
--canvas-code-block-diff-remove-background
--canvas-code-block-diff-remove-foreground
```

## Tailwind Bridge

`agent-html/styles/tokens/tailwind.css` maps L1 tokens into Tailwind theme
names. Examples:

```css
--color-background
--color-foreground
--color-muted
--color-muted-foreground
--color-primary
--color-primary-foreground
--color-success
--color-warning
--color-info
--color-destructive
--color-border
--color-ring
--color-chart-1
--color-chart-2
--color-chart-3
--color-chart-4
--color-chart-5
--radius-sm
--radius-md
--radius-lg
--radius-xl
--radius-2xl
--radius-3xl
--radius-4xl
```

This bridge is not the owner of raw values. It exposes existing named tokens to
utility classes.

## Chart Tokens

Chart raw values currently observed in `agent-html/styles/index.css` are
wrapped by chart role names:

```css
--chart-background
--chart-foreground
--chart-foreground-muted
--chart-line-primary
--chart-line-secondary
--chart-crosshair
--chart-grid
--chart-brush-border
--chart-tooltip-background
--chart-tooltip-foreground
--chart-tooltip-muted
--chart-marker-background
--chart-marker-border
--chart-marker-foreground
--chart-ring-background
--chart-label
```

Current note: `styles/index.css` is the observed location, not the preferred
ownership location. If the chart token system is kept, these values should move
to an owning token file.
