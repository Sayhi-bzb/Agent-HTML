export function formatHtmlSource(source: string) {
  const normalized = source.replace(/>\s+</g, "><").trim()
  const parts = normalized.split(/(<[^>]+>)/g).filter(Boolean)

  let indent = 0
  const lines: string[] = []

  for (const part of parts) {
    if (!part.trim()) {
      continue
    }

    const trimmed = part.trim()
    const isClosingTag = /^<\//.test(trimmed)
    const isOpeningTag = /^<[^/!][^>]*>$/.test(trimmed)
    const isSelfClosingTag = /\/>$/.test(trimmed)

    if (isClosingTag) {
      indent = Math.max(0, indent - 1)
    }

    lines.push(`${"  ".repeat(indent)}${trimmed}`)

    if (isOpeningTag && !isSelfClosingTag) {
      indent += 1
    }
  }

  return lines.join("\n")
}
