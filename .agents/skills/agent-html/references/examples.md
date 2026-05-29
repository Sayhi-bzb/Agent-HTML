# AgentHTML Examples

Use these pattern names as orientation before drafting new structure.

## Valid Patterns

- `minimal-page`: root Page with a single Section.
- `card-tabs-grid`: Cards inside Grid with nested Tabs.
- `complex-dashboard`: mixed layout, cards, metrics, and charts.
- `timeline-basic`: Timeline with status and optional icon attrs.
- `kanban-basic`: Kanban columns and items with stable values.
- `codeblock-basic`: CodeBlock with raw code text.
- `image-basic`: Image with src, alt, and fit.

## Invalid Patterns

- Bare text directly under `Page`, `Section`, `Stack`, `Cluster`, or `Grid`.
- Unknown tags or attrs.
- JSX expressions, imports, hooks, `class`, `className`, or `style`.
- Missing required attrs like `Page:title`, `Image:src`, or `Image:alt`.
- Invalid enum attrs such as unknown variants, widths, status, or language values.
- Unknown Lucide icon names.
