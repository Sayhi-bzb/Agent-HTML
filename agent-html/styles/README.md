# Canvas Styles

This directory is the Canvas CSS pipeline.

Use `index.css` as the runtime entry map. Do not put kit rules or material
values in it.

## Agent Route

- Artifact content style: read `layouts/index.css`.
- CodeBlock implementation style: read `internal/code-block.css`.
- Artifact reading container: read `internal/artifact.css`.
- Material values: read `materials/README.md`.
- Standard kit values: read `kits`.
- CodeBlock token values: read `kits/code-block.css`.
- Tailwind and shadcn token mapping: read `materials/tailwind.css`.

## Public Style API

`layouts/index.css` is the stable artifact layout API entrypoint. It imports
artifact-facing classes from narrower owner files.

`layouts/composition.css` owns L2 composition classes for ordinary artifact
content:

- layout rhythm classes: stack, cluster, wrap, and grid gap;
- surface classes: panels and icon boxes;
- type scale classes: title, heading, body, and caption.

`layouts/layout.css` owns artifact auto-layout classes:

- Stack remains the default vertical rhythm through `canvas-stack-*`.
- Grid uses `canvas-grid-2`, `canvas-grid-2-sm`, `canvas-grid-2-lg`,
  `canvas-grid-3`, `canvas-grid-3-lg`, `canvas-grid-4`,
  `canvas-grid-main-aside`, `canvas-grid-main-aside-lg`,
  `canvas-grid-main-aside-xl`, `canvas-grid-main-aside-xl-wide`,
  `canvas-grid-aside-main`, `canvas-grid-aside-main-lg`, and
  `canvas-grid-cards`.
- Frame uses `canvas-frame-table`, `canvas-frame-wide`,
  `canvas-frame-chart`, `canvas-frame-chart-lg`, `canvas-frame-map`, and
  `canvas-frame-media`.

Use Grid classes before writing arbitrary `grid-cols-[...]`. Use Frame classes
before repeating `overflow-x-auto`, width guards, media clipping, or chart/map
height scaffolding.

Raw material values stay in `materials/*`. L3 semantic role classes are not part
of the current artifact layout API.

Artifact agents may use these classes with local UI primitives. They should not import CSS files directly.

## Internal Styles

`internal` owns artifact-adjacent workspace styles and rich component
implementation styles.

Rich component tokens stay in matching token files such as
`kits/code-block.css`; content scale stays in
`kits/content.css`.

Host chrome tokens and implementation styles live in
`packages/cli/src/host/styles`. They consume this workspace material pipeline, but
they are not artifact authoring context.

Artifact source should not recreate system responsibilities such as root reading width, block hover highlighting, toolbar placement, or sidebar chrome.
Artifact source should not consume sidebar chrome utilities such as
`bg-sidebar`, `text-sidebar-*`, `border-sidebar-*`, or `ring-sidebar-*`.
