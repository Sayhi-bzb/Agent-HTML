# Chart Components

This directory owns Canvas-native chart infrastructure.

Use this directory for Canvas chart components and their shared protocol.

Target consumption chain:

```txt
low-level @visx primitives
  -> chart.tsx foundation
  -> semantic chart components
  -> optional rough SVG branch inside supported charts
  -> artifact blocks

roughjs
  -> lib/rough-svg.tsx
  -> semantic chart rough branches or artifact-local sketch decoration

specialized @visx packages
  -> matching semantic chart components
  -> artifact blocks

high-level @visx/xychart
  -> selected cartesian chart components
  + chart.tsx Canvas protocol and theme
  -> artifact blocks
```

The dependency direction is intentional. Artifacts consume Canvas semantic
charts, not visualization libraries. `chart.tsx` absorbs shared Canvas protocol:
container measurement, config, tokens, tooltip shell, hover language, scale
helpers, and shared axis/grid style. Concrete chart files absorb chart semantics:
which marks exist, which visx shape or layout package owns them, and how hover
relationships map to the data.

Use visx to remove chart engineering work, not to leak implementation detail up
the stack. Low-level primitives belong in `chart.tsx` when they make every chart
more consistent. Specialized visx packages belong in the matching chart file
when their shape or layout is the chart's semantic core. `@visx/xychart` is a
high-level exception: use it only for cartesian charts where it deletes local
scale, event, nearest-datum, axis/grid, or tooltip machinery while still obeying
the Canvas protocol exposed by `chart.tsx`.

## Layers

- `chart.tsx`: shared Canvas chart protocol: config, scoped color variables,
  responsive frame, bounds-aware tooltip, tooltip panel variants, pointer
  tooltip tracking, legend, SVG shell, hit layers, cartesian layout, shared
  hover state/opacity protocol, empty data/size separation, scale helpers, and
  `@visx/xychart` theme.
- `../../lib/rough-svg.tsx`: low-level RoughJS SVG lifecycle bridge. It owns
  RoughJS-to-React rendering only, not chart semantics, chart config, layout, or
  tooltip behavior.
- `line-chart.tsx`: reusable line chart using `@visx/xychart` for cartesian
  series, axis/grid, pointer events, and tooltip state, while consuming
  `chart.tsx` for Canvas theme and tooltip content.
- `area-chart.tsx`: reusable area chart using `@visx/xychart` for cartesian
  series, axis/grid, pointer events, and tooltip state, while consuming
  `chart.tsx` for Canvas theme and tooltip content.
- `bar-chart.tsx`: reusable vertical and horizontal bar charts using
  `@visx/shape/Bar` with one shared internal bar core.
- `pie-chart.tsx`: reusable pie chart using `@visx/shape/Pie`.
- `network-chart.tsx`: reusable network chart using `@visx/network` for graph
  rendering and Canvas-owned deterministic layout, tooltip, hover, and rough
  rendering.
- `sankey-chart.tsx`: reusable Sankey chart using `@visx/sankey`, shared
  container, SVG shell, tooltip positioning, and internal rough rendering.

Artifact blocks should import only semantic chart components from
`components/chart`. They should not import `@visx/*` packages or
chart-specific renderer internals.

## Visx Policy

Use visx primitives by responsibility:

- `@visx/responsive`, `@visx/group`, `@visx/scale`, and `@visx/event` belong in
  `chart.tsx` when they support the shared chart foundation.
- `@visx/shape` belongs in concrete chart components because shape choice is
  chart semantics.
- `@visx/sankey` belongs in `sankey-chart.tsx`; Sankey graph layout, node/link
  adjacency, and ribbon paths are chart-specific semantics.
- `@visx/network` belongs in `network-chart.tsx`; it renders graphs but does
  not provide layout, so Canvas owns deterministic node placement.
- `@visx/axis` and `@visx/grid` own numeric axis and grid rendering inside
  Canvas wrappers. Keep Canvas-owned token classes and wrapper APIs instead of
  exposing visx axis/grid directly to artifact blocks. Categorical labels stay
  Canvas-owned until chart wrappers pass real categorical scales.
- `@visx/xychart` may own cartesian chart internals only when it keeps the
  semantic chart API stable and avoids duplicating `chart.tsx` protocol.

## Boundary Rules

- Artifact blocks import semantic chart components from `components/chart`.
- Artifact blocks do not import `@visx/*` packages or chart-specific renderer
  internals.
- `chart.tsx` does not own concrete chart business semantics.
- Concrete chart components do not re-invent shared chart protocol when a
  `chart.tsx` helper already owns it.
- Rough rendering remains an internal branch of supported semantic charts, not a
  public artifact dependency.
- `lib/rough-svg.tsx` may be used by artifact-local sketch decoration when the
  artifact owns the decorative drawing and no semantic chart component applies.

## Rough Policy

- `PieChart` supports `renderer="svg" | "rough"` with a transparent hit path
  and stable rough options.
- `BarChart` supports `renderer="svg" | "rough"` with a transparent hit rect
  and stable rough options.
- `BarHChart` supports `renderer="svg" | "rough"` with a transparent hit rect
  and stable rough options.
- `SankeyChart` supports rough rendering through `roughOptions`, with
  transparent link/node hit layers and shared tooltip positioning.
- `LineChart` and `AreaChart` are SVG-only in v1 and do not expose rough as a
  valid renderer. Add rough support only after path hit testing and redraw
  stability are handled the same way as pie/bar.

## Hover Policy

- `chart.tsx` owns generic hover state, presence, opacity, and transition
  tokens.
- `BarChart`, `BarHChart`, `PieChart`, `NetworkChart`, and `SankeyChart`
  consume the shared hover protocol for highlighted and faded marks.
- Concrete charts own item relationship logic, such as Sankey node/link
  adjacency or pie slice identity.

## Tooltip Policy

- `ChartTooltip` owns positioning and container bounds.
- `ChartTooltipPanel` owns shared tooltip shell variants.
- `useChartTooltip` owns tooltip open state, data, cursor-follow point tracking,
  and positioning through `@visx/tooltip`.
- Concrete charts own active item selection and tooltip content.

## Migration Notes

- `rough-viz` bar and pie wrappers are retired in favor of semantic chart
  components.
- `borough-flow-network.block.tsx` uses `NetworkChart` instead of importing
  `rough-viz` directly.
