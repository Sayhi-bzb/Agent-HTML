import { useState } from "react"

export function useSelection<T>(initialValue: T | null = null) {
  const [selected, setSelected] = useState<T | null>(initialValue)

  return {
    clearSelection: () => setSelected(null),
    selected,
    setSelected,
  }
}
