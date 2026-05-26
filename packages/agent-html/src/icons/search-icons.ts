import { getAllIconNames } from "@/agent-html/icons/icon-registry"

export function searchIconNames(query: string, limit = 24) {
  const normalized = query.trim().toLowerCase()
  const names = getAllIconNames()

  if (!normalized) {
    return names.slice(0, limit)
  }

  const exact = names.filter((name) => name === normalized)
  const prefix = names.filter(
    (name) => name !== normalized && name.startsWith(normalized)
  )
  const contains = names.filter(
    (name) =>
      name !== normalized &&
      !name.startsWith(normalized) &&
      name.includes(normalized)
  )

  return [...exact, ...prefix, ...contains].slice(0, limit)
}

