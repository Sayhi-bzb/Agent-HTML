# Practices

## Make the First Hop Obvious

Every agent workspace should have a shallow route file.

For `agent-html`, that file is `agent-html/AGENTS.md`. It should answer:

- where to create or edit artifacts;
- which primitives and helpers are available;
- which styling layers are locked;
- when to enter style, theme, host, or runtime internals.

## Keep Frequent Files Shallow

High-frequency files should require few jumps:

- `AGENTS.md`
- `artifacts`
- `examples`
- `components`
- `hooks`
- `lib`
- `schema`
- `data`

These are the files an artifact-producing agent is expected to use often.

## Fold Low-Frequency Files

Low-frequency files should be available but not visually dominant.

Examples:

- CSS token internals and Tailwind mappings belong under `styles/tokens`;
- artifact-consumable CSS belongs in `styles/content.css`;
- locked system CSS belongs under `styles/internal`;
- theme preset resources belong under `theme`;
- static URL assets belong under `public`;
- bundled source assets belong under `assets`.

## Split by Task Route

Split files when the split lets an agent open a narrower context.

Prefer feature splits such as:

- `content.css`
- `internal/artifact.css`
- `internal/host.css`
- `tokens/content.css`
- `tokens/artifact.css`
- `tokens/host.css`

Avoid splits that only mirror technology without improving routing.

## Keep Entry Files as Maps

Entry files should import and route. They should not become large mixed-purpose knowledge dumps.

For CSS, `styles/index.css` should show the pipeline. The actual values and classes should live in token, base, content, and internal files.

## Preserve Stable Vocabulary

Use one name for one concept.

If the project says `artifact`, `host`, `runtime`, `token`, `feature`, or `theme`, reuse those names in files, directories, docs, and comments.

## Prefer Agent-Readable Boundaries

A boundary is useful when an agent can obey it during an edit.

Write boundaries as operational rules:

- "Do not style `Block`."
- "Use `styles/content.css` for reusable artifact content classes."
- "Use `styles/tokens/artifact.css` for artifact reading width and spacing."
- "Do not edit shadcn primitives unless the primitive API or accessibility behavior must change."
