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
- `heatmap-chart.tsx`: matrix density or row-by-column intensity.
- `network-chart.tsx`: node-link relationships.
- `sankey-chart.tsx`: weighted flow between stages.

## Artifact Rules

- Pass data semantics, accessors, config, renderer choice, and tooltip fields.
- Keep layout and explanatory copy in the artifact block.
- Use `renderer="svg"`, `renderer="rough"`, or `renderer="texture"` only when
  the chart supports that material.
- Do not hand-roll chart scales, axes, hit layers, tooltip positioning, rough
  rendering, texture ids, or Motion behavior in artifact blocks.
- Do not add a new chart component for one artifact if an existing chart can
  express the data truth.
