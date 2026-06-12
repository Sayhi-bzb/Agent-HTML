# React Canvas Workspace

`agent-html` is a portable Canvas source workspace. It contains durable artifact source, local primitives, styles, public static files, and source dependency metadata. It does not contain runtime install artifacts.

## Read Route

Always:

- `AGENTS.md` for hard operating rules.
- `index/README.md` for generated route summaries.

When authoring an artifact:

- `artifacts/README.md`
- `TASTE.md` for artifact composition and visual judgment.

When opening broad or large source files:

- `index/large-files.md`
- `index/dependency-summary.md`

When using or changing primitives, hooks, helpers, or theme exports:

- `components/README.md` for the component source route.
- `TASTE.md` for component choice and artifact layout judgment when UI composition is part of the task.
- `index/reuse-surface.md` for reusable hook and helper choices.
- `index/api-surface.md`
- then the closest source file

When touching Canvas classes, tokens, or internal chrome:

- `styles/README.md`

When changing workspace conventions, route files, generated indexes, artifact
or data patterns, or copyable examples:

- `GOVERNANCE.md`

## Source Placement

Source placement defaults live in `AGENTS.md`. Use the route above to choose
the smallest owner before opening source.
