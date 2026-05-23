export type SourceMetrics = {
  approxTokens: number
  chars: number
  lines: number
  words: number
}

export function getSourceMetrics(source: string): SourceMetrics {
  const normalized = source.replace(/\r\n/g, "\n").trim()
  const chars = normalized.length
  const lines = normalized.length === 0 ? 0 : normalized.split("\n").length
  const words =
    normalized.length === 0 ? 0 : normalized.split(/\s+/).filter(Boolean).length

  const identifiers =
    normalized.match(/[A-Za-z_][A-Za-z0-9_.-]*/g)?.length ?? 0
  const punctuation = normalized.match(/[<>{}()[\]/=.:;,-]/g)?.length ?? 0

  const approxTokens = Math.max(
    1,
    Math.round(chars / 4.2 + identifiers * 0.18 + punctuation * 0.12)
  )

  return {
    approxTokens,
    chars,
    lines,
    words,
  }
}
