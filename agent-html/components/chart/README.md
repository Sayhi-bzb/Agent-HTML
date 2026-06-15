# Chart Components

This directory is the artifact-facing route for Canvas semantic charts.

Use chart components when an artifact block needs data visualization. Import
concrete chart components from this directory and public chart types from
`types.ts`. Do not import `@visx/*`, `runtime/*`, `motion/react`, rough helpers,
or texture helpers from artifact source.

Need exact exports: read `../../index/api-surface.md`.
Changing shared chart protocol, renderer behavior, hover, tooltip, or visx
integration: read `runtime/README.md`.

## Choose A Chart

- `line-chart.tsx`: ordered trends where the path matters.
- `area-chart.tsx`: ordered trends with accumulated magnitude.
- `bar-chart.tsx`: category comparison; use `BarHChart` for long labels.
- `pie-chart.tsx`: small part-of-whole comparisons.
- `sunburst-chart.tsx`: hierarchical part-of-whole partitions.
- `heatmap-chart.tsx`: matrix density or row-by-column intensity.
- `network-chart.tsx`: node-link relationships.
- `sankey-chart.tsx`: weighted flow between stages.

## Artifact Rules

- Pass data semantics, accessors, renderer choice, and tooltip fields.
- Do not configure colors unless the artifact needs a deliberate semantic
  override; charts choose default color strategy from their data role.
- Keep layout and explanatory copy in the artifact block.
- Use `renderer="svg"`, `renderer="rough"`, or `renderer="texture"` only when
  the chart supports that material.
- Do not hand-roll chart scales, axes, hit layers, tooltip positioning, rough
  rendering, texture ids, or Motion behavior in artifact blocks.
- Do not add a new chart component for one artifact if an existing chart can
  express the data truth.

## Public API Style

Concrete charts should keep the artifact-facing surface predictable:

- Every concrete chart exports `XChart` and `XChartProps`.
- Export chart data types only when artifact authors must construct that shape.
  Shared chart types are exported from `types.ts`.
- Layout and material props use `className`, `aspectRatio`, `minHeight`,
  `config`, `renderer`, `rough`, and `texture`.
- Data props use `data` plus semantic accessors such as `xKey`, `yKey`,
  `valueKey`, `angleKey`, `colorKey`, or graph-specific node/link accessors.
- Formatter props name the formatted coordinate: `valueFormatter` for one-value
  charts, `xValueFormatter` / `yValueFormatter` for numeric axes, and
  `xLabelFormatter` / `yLabelFormatter` for categorical labels.
- Datum-level tooltips should expose `renderTooltip`, `tooltipFields`, and
  `tooltipLabel`. `renderTooltip` wins, `tooltipFields` supplies declarative
  rows, and the chart default remains the fallback.
- Domain props name the scale they control: `valueDomain`, `xDomain`, or
  `yDomain`.
- Existing public props stay compatible. Add aliases or additive props before
  renaming an artifact-facing API.
