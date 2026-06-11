# Chart Components

This directory owns Canvas-native chart infrastructure.

Use this directory for Canvas chart components and their shared protocol.

## Layers

- `chart.tsx`: shared Canvas chart protocol: config, scoped color variables,
  responsive frame, tooltip, legend, cartesian layout, and scale helpers.
- `rough-renderers.tsx`: RoughJS SVG render helpers.
- `line-chart.tsx`: reusable visx line chart using this shared protocol.

Concrete chart components should consume these files instead of defining local
color, tooltip, legend, layout, scale, or RoughJS lifecycle logic.
