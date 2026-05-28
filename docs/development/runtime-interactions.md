# Runtime Interaction Rules

This document defines interaction boundaries for Agent-HTML runtime behavior.
It covers runtime-owned gestures such as block drag and drop, scroll-aware hit
testing, floating runtime layers, and layout feedback.

It does not define product UX, visual styling, or component appearance. Those
rules belong in [`../design/README.md`](../design/README.md).

## Ownership

Runtime interactions under `packages/agent-html/src/runtime` may use third-party
interaction libraries for sensors, lifecycle callbacks, overlays, or accessible
primitives. Those libraries do not own Agent-HTML semantic decisions.

Agent-HTML runtime owns:

- block identity and path mapping
- hit-testing from pointer position to runtime intent
- drop intent semantics
- AST-affecting runtime decisions
- runtime feedback such as indicators and block-level previews

Third-party libraries may own:

- pointer, keyboard, or drag sensors
- lifecycle callbacks such as drag start, move, end, and cancel
- visual overlay movement
- accessibility primitives and focus behavior
- low-level popover or floating-layer positioning

## Coordinate Sources

Block hit-testing must use browser viewport coordinates from
`PointerEvent.clientX/clientY` or `MouseEvent.clientX/clientY`.

Do not derive Agent-HTML block hit-testing coordinates from:

- dnd-kit `event.delta`
- CSS transform values
- drag overlay DOMRects
- scroll-adjusted translate values
- floating-layer placement results

Those values describe visual movement or library internals. They are not stable
business coordinates for Agent-HTML drop intent.

## Geometry Freshness

Drop intent must be inferred from the latest browser client pointer and current
block geometry.

Use current `getBoundingClientRect()` values when computing block candidates.
Do not reuse candidate rects across scroll or layout frames unless the cache has
a clear invalidation path for scroll, resize, layout transition, and block
registration changes.

The safe default is:

```text
browser client pointer + live block DOMRects -> drop intent
```

The unsafe pattern is:

```text
drag transform delta + cached rects -> drop intent
```

## Layer Separation

Runtime interaction layers must not infer state from each other unless that
relationship is explicit.

- Drag overlay is a visual layer. It follows the drag library and should not be
  used as the source for block hit-testing.
- Drop indicator is feedback for the current drop intent. It may read the target
  block DOMRect when rendering, but it should not own intent calculation.
- AST mutation happens only after a committed drop intent. Drag movement should
  not mutate the AST.
- Floating popovers and hover cards are secondary UI layers. Their placement
  must not affect block hit-testing.

## Selection and Cursor Boundaries

Runtime-rendered content is content first. Text, code bodies, and generated
document output should remain selectable unless the element is an interaction
control.

Rules:

- runtime viewport roots should preserve selectable content behavior
- block handles, drag affordances, overlays, copy buttons, scrollbars, and line
  numbers should disable text selection
- drag handles should use drag cursor semantics without making the whole content
  block non-selectable
- selection policy must not be inferred from drag state, hover state, or
  third-party library internals

## Scroll-Aware Dragging

Scroll can happen while a drag is active. During scroll-aware dragging:

- keep the latest real browser client pointer as runtime state
- recompute drop intent from current DOMRects after scroll changes
- do not treat auto-scroll deltas as pointer movement
- keep drag lifecycle handling separate from block hit-testing

If a library performs auto-scroll, its scroll-adjusted movement is still a visual
drag value. Agent-HTML block hit-testing must continue using the real browser
client pointer.

## Similar Risk Areas

Apply these rules when working on:

- drag and drop
- resize handles
- scroll-driven previews
- virtualized content
- floating cards, popovers, and tooltips
- layout transition animations
- any feature that combines pointer movement, scroll, and DOMRects

When a feature needs both visual movement and semantic hit-testing, name those
states separately. For example, prefer `clientPointer` for browser hit-testing
and `dragTransform` for visual movement.
