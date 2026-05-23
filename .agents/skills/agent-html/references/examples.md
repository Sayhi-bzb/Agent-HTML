# Agent-HTML Examples

Source fixtures live in:

- `src/agent-html/fixtures/valid/`
- `src/agent-html/fixtures/invalid/`

Use the closest valid fixture before inventing new structure.

## Valid Patterns

- `minimal-page.xml`
  - Smallest legal page with `Page -> Stack -> Card`
- `card-tabs-grid.xml`
  - Tabs + accordion + table composition
- `complex-dashboard.xml`
  - Multi-section dashboard with layout primitives, cards, table, carousel, chart, and icons
- `icon-basic.xml`
  - Minimal icon usage in `Alert` and `Badge`

## Invalid Patterns

- `unknown-tag.xml`
  - Unknown DSL tag
- `bare-text-under-grid.xml`
  - Bare text directly under layout node
- `missing-tabs-trigger-value.xml`
  - Required attr missing
- `carousel-missing-content.xml`
  - `Carousel` missing `CarouselContent`
- `chart-missing-series.xml`
  - `Chart` missing `ChartSeries`
- `unknown-icon-name.xml`
  - Lucide icon name not found

## Usage Guidance

- Start from `minimal-page.xml` for tiny pages.
- Start from `card-tabs-grid.xml` for common UI compositions.
- Start from `complex-dashboard.xml` for realistic multi-panel pages.
- Start from `icon-basic.xml` when testing icon placement.
