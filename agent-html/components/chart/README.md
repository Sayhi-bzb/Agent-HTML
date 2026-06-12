# Chart Components

This directory owns Canvas-native semantic chart components.

Use this directory for concrete Canvas chart components. Shared chart protocol
lives in `../ui/chart.tsx`.

Target consumption chain:

```txt
Motion runtime + chartMotion spring protocol
  -> semantic chart interaction and mark motion
  -> renderer option: svg | rough
  -> artifact blocks

low-level @visx primitives
  -> components/ui/chart.tsx foundation
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
  + components/ui/chart.tsx Canvas protocol and theme
  -> artifact blocks
```

The dependency direction is intentional. Artifacts consume Canvas semantic
charts, not visualization libraries. `components/ui/chart.tsx` absorbs shared
Canvas protocol: container measurement, config, tokens, tooltip shell, hover
language, scale helpers, and shared axis/grid style. Concrete chart files absorb chart semantics:
which marks exist, which visx shape or layout package owns them, and how hover
relationships map to the data.

Use visx to remove chart engineering work, not to leak implementation detail up
the stack. Low-level primitives belong in `components/ui/chart.tsx` when they
make every chart more consistent. Specialized visx packages belong in the matching chart file
when their shape or layout is the chart's semantic core. `@visx/xychart` is a
high-level exception: use it only for cartesian charts where it deletes local
scale, event, nearest-datum, axis/grid, or tooltip machinery while still obeying
the Canvas protocol exposed by `components/ui/chart.tsx`.

## Layers

- `../ui/chart.tsx`: shared Canvas chart protocol: config, scoped color variables,
  responsive frame, bounds-aware tooltip, tooltip panel variants, pointer
  tooltip tracking, interaction roots, legend, SVG shell, hit layers, cartesian
  layout, shared hover state/opacity protocol, empty data/size separation,
  required Motion runtime wrappers, spring motion protocol, scale helpers, and
  `@visx/xychart` theme.
- `../../lib/rough-svg.tsx`: low-level RoughJS SVG lifecycle bridge. It owns
  RoughJS-to-React rendering only, not chart semantics, chart config, layout, or
  tooltip behavior.
- `line-chart.tsx`: reusable line chart using `@visx/xychart` for cartesian
  series, axis/grid, pointer events, and tooltip state, while consuming
  `../ui/chart.tsx` for Canvas theme and tooltip content.
- `area-chart.tsx`: reusable area chart using `@visx/xychart` for cartesian
  series, axis/grid, pointer events, and tooltip state, while consuming
  `../ui/chart.tsx` for Canvas theme and tooltip content.
- `scatter-chart.tsx`: reusable scatter chart using `@visx/xychart` for
  numeric scale, axis/grid, glyph placement, pointer events, and tooltip state,
  while artifact blocks pass only semantic accessors, domains, ticks, and
  tooltip fields.
- `bar-chart.tsx`: reusable vertical and horizontal bar charts using
  `@visx/shape/Bar` with one shared internal bar core.
- `pie-chart.tsx`: reusable pie chart using `@visx/shape/Pie`.
- `heatmap-chart.tsx`: reusable heatmap chart using `@visx/heatmap` for cell
  placement while Canvas owns labels, tooltip, hover, and color protocol.
- `network-chart.tsx`: reusable network chart using `@visx/network` for graph
  rendering and Canvas-owned deterministic layout, tooltip, hover, and rough
  rendering.
- `sankey-chart.tsx`: reusable Sankey chart using `@visx/sankey`, shared
  container, SVG shell, tooltip positioning, and internal rough rendering.

Artifact blocks should import only semantic chart components from
`components/chart` and shared chart protocol types from `components/ui/chart`.
They should not import `@visx/*` packages or chart-specific renderer internals.

## Visx Policy

Use visx primitives by responsibility:

- `@visx/responsive`, `@visx/group`, `@visx/scale`, and `@visx/event` belong in
  `components/ui/chart.tsx` when they support the shared chart foundation.
- `@visx/shape` belongs in concrete chart components because shape choice is
  chart semantics.
- `@visx/sankey` belongs in `sankey-chart.tsx`; Sankey graph layout, node/link
  adjacency, and ribbon paths are chart-specific semantics.
- `@visx/network` belongs in `network-chart.tsx`; it renders graphs but does
  not provide layout, so Canvas owns deterministic node placement.
- `@visx/heatmap` belongs in `heatmap-chart.tsx`; heatmap cell generation is
  chart-specific, while artifact blocks pass semantic row and column data.
- `@visx/axis` and `@visx/grid` own numeric axis and grid rendering inside
  Canvas wrappers. Keep Canvas-owned token classes and wrapper APIs instead of
  exposing visx axis/grid directly to artifact blocks. Categorical labels stay
  Canvas-owned until chart wrappers pass real categorical scales.
- `@visx/xychart` may own cartesian chart internals only when it keeps the
  semantic chart API stable and avoids duplicating `components/ui/chart.tsx`
  protocol.
  Xychart-only addons live in the concrete chart that renders them.
- `@visx/xychart/GlyphSeries` owns reusable scatter mark placement and event
  registration. Artifact blocks should not hand-roll scatter SVG coordinates,
  log scales, or native SVG titles.

## Interaction Ownership

- Visx owns geometry, layout, scale, axis, grid, and primitive mark generation.
- Canvas owns interaction lifecycle: hit layers, hover state, tooltip state,
  tooltip shell, container leave cleanup, and unmount cleanup.
- Canvas Motion wrappers and spring presets are required chart infrastructure,
  not artifact options and not renderers. Concrete charts consume
  `ChartMotion*` and `chartMotion` for chart-owned hover, fade, and layout
  transitions.
- Discrete mark charts use Canvas hit layers (`ChartHitRect`, `ChartHitPath`,
  `ChartHitCircle`, `ChartHitLine`) and `ChartInteractionRoot`.
- Curved or compound paths may keep local transparent path hit geometry, but
  pointer events and cleanup still go through the shared hover/tooltip protocol.
- `@visx/xychart` tooltip is reserved for whole-chart nearest-datum models such
  as line and area charts. Do not use it as the default interaction model for
  discrete mark charts.
- Nearest-datum charts animate active affordances, such as tooltip glyphs,
  rather than fading unrelated marks.
- Artifact blocks pass data semantics and tooltip fields. They should not own
  tooltip positioning, portal behavior, or mark cleanup.

## Boundary Rules

- Artifact blocks import semantic chart components from `components/chart`.
- Artifact blocks import shared chart protocol types from `components/ui/chart`.
- Artifact blocks do not import `@visx/*` packages or chart-specific renderer
  internals.
- Artifact blocks do not import `motion/react`; Motion is consumed through
  Canvas chart protocol wrappers.
- `components/ui/chart.tsx` does not own concrete chart business semantics.
- `components/chart` does not re-export shared chart protocol APIs.
- Concrete chart components do not re-invent shared chart protocol when a
  `components/ui/chart.tsx` helper already owns it.
- Rough rendering remains an internal branch of supported semantic charts, not a
  public artifact dependency.
- Rough option shaping that depends on concrete data keys belongs in the
  concrete chart, not in `components/ui/chart.tsx`.
- `lib/rough-svg.tsx` may be used by artifact-local sketch decoration when the
  artifact owns the decorative drawing and no semantic chart component applies.

## Rough Policy

- `renderer` is a visual material choice. Keep public renderer values limited to
  `svg` and `rough`; Motion and spring belong below this layer as required
  chart motion.

- `PieChart` supports `renderer="svg" | "rough"` with a transparent hit path
  and stable rough options.
- `BarChart` supports `renderer="svg" | "rough"` with a transparent hit rect
  and stable rough options.
- `BarHChart` supports `renderer="svg" | "rough"` with a transparent hit rect
  and stable rough options.
- `HeatmapChart` supports `renderer="svg" | "rough"` with `@visx/heatmap`
  cell layout, rough circle marks, and `ChartHitCircle` hit layers.
- `SankeyChart` supports rough rendering through `roughOptions`, with
  Sankey-specific path hit geometry and shared tooltip positioning.
- `AreaChart` supports `renderer="svg" | "rough"` by letting `@visx/xychart`
  compute area and line paths while `RoughPath` owns the rough visual path.
- `LineChart` is SVG-only in v1 and does not expose rough as a valid renderer.
  Add rough support only after path hit testing and redraw stability are handled
  the same way as area/pie/bar.

## Hover Policy

- `components/ui/chart.tsx` owns generic hover state, presence, opacity, and transition
  tokens.
- `components/ui/chart.tsx` owns mark identity helpers. Discrete charts use
  `getChartMarkKey`, `getChartMarkPresence`, and `getChartMarkOpacity` instead
  of hand-built hover keys or local opacity branches.
- `BarChart`, `BarHChart`, `PieChart`, `HeatmapChart`, `NetworkChart`, and
  `SankeyChart` consume the shared hover protocol for highlighted and faded
  marks.
- `LineChart` and other nearest-datum charts keep xychart hover ownership and
  consume Canvas Motion only for active datum affordances.
- Concrete charts own item relationship logic, such as Sankey node/link
  adjacency or pie slice identity.

## Tooltip Policy

- `ChartTooltip` owns positioning and container bounds.
- `ChartTooltipPanel` owns shared tooltip shell variants.
- `useChartTooltip` owns tooltip open state, data, cursor-follow point tracking,
  and positioning through `@visx/tooltip`.
- `ChartTooltipField` and `resolveChartTooltipItems` let semantic charts expose
  declarative tooltip field APIs without leaking tooltip shell components into
  artifact blocks.
- Concrete charts own active item selection and tooltip content.

## Migration Notes

- `rough-viz` bar and pie wrappers are retired in favor of semantic chart
  components.
- `borough-flow-network.block.tsx` uses `NetworkChart` instead of importing
  `rough-viz` directly.
