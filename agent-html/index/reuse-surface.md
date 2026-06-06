<!-- generated: do not edit -->

# React Canvas Reuse Surface

Decision surface for reusable `agent-html` hooks, helpers, schemas, and data.
Use this file to decide whether an existing owner fits before opening source.

## Hooks

| Need | Use | Import | Minimal Signature | Read Next |
| --- | --- | --- | --- | --- |
| Filter a local list by text query | `useFilter` | `agent-html/hooks/use-filter.ts` | `useFilter<T>(items, getSearchText) -> { filteredItems, query, setQuery }` | `hooks/use-filter.ts` |
| Track one selected item or clear selection | `useSelection` | `agent-html/hooks/use-selection.ts` | `useSelection<T>(initialValue?) -> { selected, setSelected, clearSelection }` | `hooks/use-selection.ts` |
| Branch behavior for mobile layout | `useIsMobile` | `agent-html/hooks/use-mobile.ts` | `useIsMobile() -> boolean` | `hooks/use-mobile.ts` |

## Lib

| Need | Use | Import | Minimal Signature | Read Next |
| --- | --- | --- | --- | --- |
| Merge conditional class names | `cn` | `agent-html/lib/cn.ts` | `cn(...inputs) -> string` | `lib/cn.ts` |
| Compose React refs | `composeRefs`, `useComposedRefs` | `agent-html/lib/compose-refs.ts` | `composeRefs(...refs) -> ref callback` | `lib/compose-refs.ts` |
| Format dates for display | `formatDate` | `agent-html/lib/format-date.ts` | `formatDate(value) -> string` | `lib/format-date.ts` |
| Parse usage dashboard CSV | `parseUsageDashboardCsv`, `latestUsageRows` | `agent-html/lib/usage-dashboard.ts` | `parseUsageDashboardCsv(csv) -> UsageDashboardRow[]` | `data/README.md`, then `lib/usage-dashboard.ts` |

## Schema And Data

| Need | Use | Import | Minimal Signature | Read Next |
| --- | --- | --- | --- | --- |
| Validate research-style artifact items | `researchItemSchema`, `researchItemsSchema` | `agent-html/schema/artifact-data.ts` | `researchItemsSchema.parse(value) -> ResearchItem[]` | `schema/artifact-data.ts`, `data/example-items.json` |
| Use sample research items | `example-items.json` | `agent-html/data/example-items.json` | `ResearchItem[]` fixture | `data/README.md` |
| Use usage dashboard rows | `public.usage_dashboard_hourly.csv` | `agent-html/data/public.usage_dashboard_hourly.csv` | Raw CSV for `parseUsageDashboardCsv` | `data/README.md`, then `lib/usage-dashboard.ts` |

## Boundary

This file answers when to reuse an owner. `api-surface.md` answers exact exports. Open source only after these maps identify the likely owner.
