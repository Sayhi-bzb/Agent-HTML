# Chart Runtime

This directory owns shared Canvas chart protocol for concrete chart components.
It is not an artifact authoring route.

## Ownership

- `runtime/`: shared chart container, config, scoped color variables, tooltip
  shell, hover state, hit layers, legend, SVG shell, cartesian layout, scale
  helpers, Motion wrappers, spring protocol, and renderer fallback.
- `renderer.tsx`: shared SVG, RoughJS, and texture material branches for
  reusable path, rect, and circle marks.
- `../../../lib/rough-svg.tsx`: RoughJS-to-React rendering only. Runtime consumes
  it but does not own it.
- `texture.tsx`: `@visx/pattern` ids, defaults, fills, and
  pointer-transparent texture overlays.
- Concrete `*-chart.tsx` files: chart semantics, mark choice, visx package
  choice, layout model, and data relationship logic.

## Dependency Direction

Artifacts consume semantic charts. Concrete charts consume runtime protocol.
Runtime may consume low-level visx helpers when the helper makes every chart
more consistent. Concrete charts consume specialized visx packages when the
package is the chart's semantic core.

Use visx to remove chart engineering work without exposing visx to artifact
blocks.

## Visx Placement

- Put `@visx/responsive`, `@visx/group`, `@visx/scale`, and `@visx/event` in
  runtime when they support the shared foundation.
- Put `@visx/shape` in concrete charts when shape choice is chart semantics.
- Put `@visx/sankey`, `@visx/network`, and `@visx/heatmap` in the matching
  concrete chart.
- Keep `@visx/axis` and `@visx/grid` behind Canvas wrappers and token classes.
- Use `@visx/xychart` only when it preserves the semantic chart API and removes
  local cartesian machinery.
- Keep `@visx/pattern` wiring inside Canvas texture helpers and semantic charts.

## Interaction

- Canvas owns hit layers, hover state, tooltip state, cleanup, tooltip shell,
  and cursor-follow positioning.
- Concrete charts own item relationship logic, such as adjacency, slice
  identity, or node-link relation.
- Discrete mark charts use `useChartMarkInteraction`, shared hit layers, and
  `ChartInteractionRoot`.
- Nearest-datum charts may use xychart tooltip ownership and animate only the
  active affordance.
- Concrete charts consume `ChartMotion*` and `chartMotion`; artifacts do not
  import `motion/react`.

## Renderer

- Public renderer values stay `svg`, `rough`, and `texture`.
- Unsupported renderer values resolve to `svg` inside the chart.
- Reusable path, rect, and circle marks go through `runtime/renderer.tsx`.
- Direct rough or texture primitive imports are reserved for chart-specific
  visual layers that cannot use reusable marks.
- Rough option shaping that depends on concrete data keys belongs in the
  concrete chart.

## Material And Color

- `material.tsx` owns chart color strategy, scoped CSS color variables, texture
  definitions, and reusable renderer props.
- Concrete charts declare their data role with a strategy: `single`,
  `categorical`, `sequential`, or `relational`.
- Artifact blocks should not pass color config for ordinary charts. `config`
  remains an override for deliberate semantic color decisions.
- Color config precedence is user config, chart semantic defaults, then runtime
  strategy defaults.

Current renderer support:

- `BarChart`, `BarHChart`, `PieChart`, `AreaChart`, `HeatmapChart`, and
  `SunburstChart`: `svg`, `rough`, and `texture`.
- `RadarChart`: `svg`, `rough`, and `texture`.
- `NetworkChart`: `svg`, `rough`, and `texture`; texture applies to node fill.
- `ScatterChart`: `svg`, `rough`, and `texture` with xychart-owned placement.
- `SankeyChart`: `svg`, `rough`, and `texture`.
- `LineChart`: accepts `renderer` for API consistency and resolves to `svg`.

## Tooltip

- `ChartTooltip` owns positioning and container bounds.
- `ChartTooltipPanel` owns the shared shell.
- `useChartTooltip` owns open state, data, cursor point tracking, and
  positioning through `@visx/tooltip`.
- `ChartTooltipField` and `resolveChartTooltipItems` expose declarative fields
  without leaking tooltip shell components into artifact blocks.
- Concrete charts that render datum-level tooltips should expose
  `renderTooltip`, `tooltipFields`, and `tooltipLabel`. Custom renderers win,
  declarative fields are the structured path, and chart defaults stay as the
  compatibility fallback.

## Migration Notes

- `rough-viz` bar and pie wrappers are retired.
- `borough-flow-network.block.tsx` uses `NetworkChart` instead of importing
  `rough-viz` directly.
