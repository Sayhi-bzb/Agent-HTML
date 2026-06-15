# React Canvas Index

Generated decision layer for `agent-html`.

Use this directory to choose the next file to open. It is an agent-facing index layer, not a source layer and not a full dependency dump.

## Read Order

1. Read `api-surface.md` when checking component, hook, helper, or schema exports.
2. Read `style-surface.md` when choosing default Canvas artifact CSS classes.
3. Open source only after the index identifies the relevant file.

## Files

- `api-surface.md` maps compact exported API surfaces.
- `style-surface.md` maps generated artifact CSS class names.

Full declarations are temporary machine inputs under `node_modules/.tmp`, not committed agent context. Regenerate with `npm run canvas:index`.
