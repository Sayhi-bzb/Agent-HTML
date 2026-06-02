# AgentHTML Examples

Use these pattern names as orientation before drafting new structure.

## Valid Patterns

- `minimal-cell`: root Cell with layout containing a Block.
- `card-tabs-grid`: Cards inside Grid with nested Tabs.
- `complex-dashboard`: mixed layout, cards, metrics, and charts.
- `timeline-basic`: Timeline with status and optional icon attrs.
- `kanban-basic`: Kanban columns and items with stable values.
- `codeblock-basic`: CodeBlock with raw code text.
- `image-basic`: Image with src, alt, and fit.

## Invalid Patterns

- Bare text directly under `Cell`, `Block`, `Section`, `Stack`, `Cluster`, or `Grid`.
- UI directly under `Cell` or layout nodes instead of being wrapped by `Block`.
- Unknown tags or attrs.
- JSX expressions, imports, hooks, `class`, `className`, or `style`.
- Missing required attrs like `Cell:title`, `Image:src`, or `Image:alt`.
- Invalid enum attrs such as unknown variants, widths, status, or language values.
- Unknown Lucide icon names.
