import { useMemo, useState } from "react"

export function useFilter<T>(
  items: readonly T[],
  getSearchText: (item: T) => string
) {
  const [query, setQuery] = useState("")
  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) {
      return items
    }

    return items.filter((item) =>
      getSearchText(item).toLowerCase().includes(normalized)
    )
  }, [getSearchText, items, query])

  return {
    filteredItems,
    query,
    setQuery,
  }
}
