export function readObject(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null
}

export function readString(value: unknown, keys: string[]): string | undefined {
  let current = value
  for (const key of keys) {
    const object = readObject(current)
    if (!object) {
      return undefined
    }
    current = object[key]
  }

  return typeof current === "string" ? current : undefined
}

export function readScalarAsString(
  value: unknown,
  keys: string[]
): string | undefined {
  let current = value
  for (const key of keys) {
    const object = readObject(current)
    if (!object) {
      return undefined
    }
    current = object[key]
  }

  if (typeof current === "string") {
    return current
  }

  if (typeof current === "number") {
    return String(current)
  }

  return undefined
}
