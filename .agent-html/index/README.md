# React Canvas Index

Generated decision layer for `.agent-html`.

Use this directory to choose the next file to open. It is an agent-facing index layer, not a source layer and not a full dependency dump.

## Read Order

1. Read `large-files.md` before opening broad coverage artifacts or large primitives.
2. Read `dependency-summary.md` before broad dependency or boundary work.
3. Read `api-surface.md` when checking component, hook, helper, schema, or theme exports.
4. Open source only after the index identifies the relevant file.

## Files

- `large-files.md` flags files that should be read by route, not by default.
- `dependency-summary.md` maps dependency-cruiser graph health and high-gravity modules.
- `api-surface.md` maps compact exported API surfaces.

Full declarations and dependency graphs are temporary machine inputs under `node_modules/.tmp`, not committed agent context. Regenerate with `npm run react-canvas:index`.
