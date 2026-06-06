# Components

This directory is the Canvas component source route. Use it to choose the
component layer before opening source files.

## Layers

- `ui/*`: low-level visual primitives from shadcn-style conventions.
- `code-block.tsx`: rich content component for code, commands, prompts, and generated text.
- `data-table.tsx`: rich record table component for sorting, filtering, selection, pagination, and column visibility.
- `kanban.tsx`: rich drag-and-drop board workflow component.

## Read Next

- Unsure which component fits the task: `../../docs/ui/README.md`.
- Need exact exports: `../index/api-surface.md`.
- Opening large component files: `../index/large-files.md`.

## Rule

Do not scan every component before choosing a layer. Use `ui/*` for ordinary
actions, inputs, display, disclosure, overlays, and navigation primitives. Use
`code-block.tsx` when the artifact needs selectable code, commands, prompts, or
generated text. Use `data-table.tsx` when records need table interactions beyond
basic visual rows. Use `kanban.tsx` only when the artifact needs the full board
workflow.
