# Canvas Styles

This directory is the Canvas CSS pipeline.

Use `index.css` as the runtime entry map. Do not put feature rules or token values in it.

## Agent Route

- Artifact content style: read `content.css`.
- Artifact reading container: read `internal/artifact.css`.
- Host chrome, sidebar, toolbar, block hover, and block actions: read `internal/host.css`.
- Theme editor chrome: read `internal/theme-editor.css`.
- Token values: read `tokens/README.md`.
- Tailwind and shadcn token mapping: read `tokens/tailwind.css`.

## Public Style API

`content.css` is the only style file intended for ordinary artifact consumption.

- layout rhythm classes: stack, cluster, wrap, and grid gap;
- surface classes: panels and icon boxes;
- type scale classes: title, heading, body, and caption.

Artifact agents may use these classes with local UI primitives. They should not import CSS files directly.

## Internal Styles

`internal` owns locked Canvas chrome and protocol-adjacent styling.

Artifact source should not recreate system responsibilities such as root reading width, block hover highlighting, toolbar placement, or sidebar chrome.
