# React Canvas Index

Generated decision layer for `agent-html`.

Use this directory to choose the next file to open. It is an agent-facing index layer, not a source layer and not a full dependency dump.

## Read Order

1. Read `large-files.md` before opening broad coverage artifacts or large primitives.
2. Read `dependency-summary.md` before broad dependency or boundary work.
3. Read `reuse-surface.md` when choosing reusable hooks or helpers.
4. Read `api-surface.md` when checking component, hook, helper, or schema exports.
5. Read `style-surface.md` when checking Canvas artifact CSS classes.
6. Read `style-token-surface.md` when checking Canvas CSS token names.
7. Read `style-scale-surface.md` when comparing CSS scale values.
8. Open source only after the index identifies the relevant file.

## Files

- `large-files.md` flags files that should be read by route, not by default.
- `dependency-summary.md` maps dependency-cruiser graph health and high-gravity modules.
- `reuse-surface.md` maps reusable source owners to use cases and minimal signatures.
- `api-surface.md` maps compact exported API surfaces.
- `style-surface.md` maps generated artifact CSS class names.
- `style-token-surface.md` maps generated CSS token parameter names.
- `style-scale-surface.md` maps generated CSS scale values to token names.

Full declarations and dependency graphs are temporary machine inputs under `node_modules/.tmp`, not committed agent context. Regenerate with `npm run canvas:index`.
