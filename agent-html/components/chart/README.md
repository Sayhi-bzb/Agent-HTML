# Chart Components

This directory owns Canvas-native chart infrastructure.

Use this directory for Canvas chart components and their shared protocol.

## Layers

- `chart.tsx`: shared Canvas chart protocol: config, scoped color variables,
  responsive frame, tooltip, legend, SVG shell, hit layers, cartesian layout,
  interaction helpers, and scale helpers.
- `rough-renderers.tsx`: RoughJS SVG render helpers. Rough is an optional
  renderer backend, not the chart protocol.
- `line-chart.tsx`: reusable visx line chart using `@visx/shape/LinePath`.
- `area-chart.tsx`: reusable visx area chart using `@visx/shape/AreaClosed`.
- `bar-chart.tsx`: reusable vertical bar chart using `@visx/shape/Bar`.
- `pie-chart.tsx`: reusable pie chart using `@visx/shape/Pie`.

Concrete chart components should consume these files instead of defining local
color, tooltip, legend, layout, scale, or RoughJS lifecycle logic.

## Visx Policy

Use visx primitives by responsibility:

- `@visx/responsive`, `@visx/group`, `@visx/scale`, and `@visx/event` belong in
  `chart.tsx` when they support the shared chart foundation.
- `@visx/shape` belongs in concrete chart components because shape choice is
  chart semantics.
- `@visx/axis` and `@visx/grid` are available, but v1 uses Canvas-owned axis and
  grid helpers to keep DOM shape, Tailwind styling, and artifact ergonomics
  stable. Revisit only if a chart needs richer axis behavior.

## Rough Policy

- `PieChart` supports `renderer="svg" | "rough"` with a transparent hit path
  and stable rough options.
- `BarChart` supports `renderer="svg" | "rough"` with a transparent hit rect
  and stable rough options.
- `LineChart` and `AreaChart` are SVG-only in v1. Add rough support only after
  path hit testing and redraw stability are handled the same way as pie/bar.
