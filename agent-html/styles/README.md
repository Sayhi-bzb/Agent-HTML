# Canvas Styles

This directory is the Canvas CSS pipeline.

Use `index.css` as the runtime entry map. Do not put feature rules or token values in it.

## Agent Route

- Artifact content style: read `public/content.css`.
- CodeBlock implementation style: read `internal/code-block.css`.
- Artifact reading container: read `internal/artifact.css`.
- Host chrome, sidebar, toolbar, block hover, and block actions: read `internal/host.css`.
- Theme editor chrome: read `internal/theme-editor.css`.
- Token values: read `tokens/README.md`.
- Feature token values: read `tokens/features`.
- CodeBlock token values: read `tokens/features/code-block.css`.
- Tailwind and shadcn token mapping: read `tokens/tailwind.css`.

## Public Style API

`public/content.css` is the stable artifact style API entrypoint. It imports
public artifact classes from narrower owner files.

`public/composition.css` owns L2 composition classes for ordinary artifact
content:

- layout rhythm classes: stack, cluster, wrap, and grid gap;
- surface classes: panels and icon boxes;
- type scale classes: title, heading, body, and caption.

`public/layout.css` owns artifact auto-layout classes:

- Stack remains the default vertical rhythm through `canvas-stack-*`.
- Grid uses `canvas-grid-2`, `canvas-grid-2-lg`, `canvas-grid-3`,
  `canvas-grid-3-lg`, `canvas-grid-4`, `canvas-grid-main-aside`,
  `canvas-grid-main-aside-lg`, `canvas-grid-main-aside-xl`,
  `canvas-grid-aside-main`, `canvas-grid-aside-main-lg`, and
  `canvas-grid-cards`.
- Frame uses `canvas-frame-table`, `canvas-frame-wide`,
  `canvas-frame-chart`, `canvas-frame-chart-lg`, `canvas-frame-map`, and
  `canvas-frame-media`.

Use Grid classes before writing arbitrary `grid-cols-[...]`. Use Frame classes
before repeating `overflow-x-auto`, width guards, media clipping, or chart/map
height scaffolding.

L1 token values stay in `tokens/*`. L3 semantic role classes are not part of
the current public style API.

Artifact agents may use these classes with local UI primitives. They should not import CSS files directly.

## Internal Styles

`internal` owns locked Canvas chrome, protocol-adjacent styling, and rich
component implementation styles.

Rich component tokens stay in matching token files such as
`tokens/features/code-block.css`; public content scale stays in
`tokens/features/content.css`.

Artifact source should not recreate system responsibilities such as root reading width, block hover highlighting, toolbar placement, or sidebar chrome.
Artifact source should not consume sidebar chrome utilities such as
`bg-sidebar`, `text-sidebar-*`, `border-sidebar-*`, or `ring-sidebar-*`.
