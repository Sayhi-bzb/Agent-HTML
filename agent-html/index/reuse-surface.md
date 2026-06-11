<!-- generated: do not edit -->

# React Canvas Reuse Surface

Decision surface for reusable `agent-html` hooks and helpers.
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

## Boundary

This file answers when to reuse an owner. `api-surface.md` answers exact exports. Open source only after these maps identify the likely owner.
