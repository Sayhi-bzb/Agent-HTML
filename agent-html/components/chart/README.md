# Chart Components

This directory owns Canvas-native chart infrastructure.

Use this directory for Canvas chart components and their shared protocol.

Target consumption chain:

```txt
@visx primitives
  -> chart.tsx foundation
  -> semantic chart components
  -> optional rough renderer branch inside supported charts
  -> artifact blocks
```

## Layers

- `chart.tsx`: shared Canvas chart protocol: config, scoped color variables,
  responsive frame, bounds-aware tooltip, tooltip panel variants, pointer
  tooltip tracking, legend, SVG shell, hit layers, cartesian layout, shared
  hover state/opacity protocol, empty data/size separation, interaction
  helpers, and scale helpers.
- `rough-renderers.tsx`: internal RoughJS SVG render helpers. Rough is an
  optional renderer branch inside supported chart components, not a public
  artifact entrypoint and not the chart protocol.
- `line-chart.tsx`: reusable visx line chart using `@visx/shape/LinePath`.
- `area-chart.tsx`: reusable visx area chart using `@visx/shape/AreaClosed`.
- `bar-chart.tsx`: reusable vertical bar chart using `@visx/shape/Bar`.
- `bar-h-chart.tsx`: reusable horizontal bar chart using `@visx/shape/Bar`.
- `pie-chart.tsx`: reusable pie chart using `@visx/shape/Pie`.
- `sankey-chart.tsx`: reusable Sankey chart using `@visx/sankey`, shared
  container, SVG shell, tooltip positioning, and internal rough rendering.

Artifact blocks should import only semantic chart components from
`components/chart`. They should not import `@visx/*` packages or
`rough-renderers.tsx` directly.

## Visx Policy

Use visx primitives by responsibility:

- `@visx/responsive`, `@visx/group`, `@visx/scale`, and `@visx/event` belong in
  `chart.tsx` when they support the shared chart foundation.
- `@visx/shape` belongs in concrete chart components because shape choice is
  chart semantics.
- `@visx/sankey` belongs in `sankey-chart.tsx`; Sankey graph layout, node/link
  adjacency, and ribbon paths are chart-specific semantics.
- `@visx/axis` and `@visx/grid` are available, but v1 uses Canvas-owned axis and
  grid helpers to keep DOM shape, Tailwind styling, and artifact ergonomics
  stable. Revisit only if a chart needs richer axis behavior.

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
- `BarChart`, `BarHChart`, `PieChart`, and `SankeyChart` consume the shared
  hover protocol for highlighted and faded marks.
- Concrete charts own item relationship logic, such as Sankey node/link
  adjacency or pie slice identity.

## Tooltip Policy

- `ChartTooltip` owns positioning and container bounds.
- `ChartTooltipPanel` owns shared tooltip shell variants.
- `useChartPointerTooltip` owns cursor-follow point tracking.
- Concrete charts own active item selection and tooltip content.

## Migration Notes

- `rough-viz` bar and pie wrappers are retired in favor of semantic chart
  components.
- `borough-flow-network.block.tsx` still uses rough-viz directly for its
  network/force view; treat that as a separate migration from bar/pie chart
  foundation work.
